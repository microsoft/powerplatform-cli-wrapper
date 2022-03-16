# Project

> This repo has been populated by an initial template to help get you started. Please
> make sure to update the content to build a great experience for community-building.

Please check the design for better understanding - ![Architecture](/images/Architecture.PNG)

Cli-Wrapper by itself doesn't call a specific version of PAC CLI, it lets the individual host to decide which version of PAC CLI to be used. Although, it is recommened if all hosts use the latest version of PAC CLI. Whenever a latest version of PAC CLI is released, each host needs to update it and make new releases.(https://github.com/microsoft/powerplatform-build-tools/blob/main/nuget.json#:~:text=%22packages%22%3A%20%5B-,%7B,%7D,-%5D and https://github.com/microsoft/powerplatform-actions/blob/main/gulpfile.js#:~:text=const%20cliVersion%20%3D%20%271.11.8%27%3B)

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## Setting Up Dev Environment

Windows, macOS or Linux:

- [Node.js LTS (currently v12)](https://nodejs.org/en/download/)
- gulp CLI: ```npm install -g gulp-cli```
- [git](https://git-scm.com/downloads)
- [VS Code](https://code.visualstudio.com/Download) or your different favorite editor
- recommended VSCode extensions:
  - [EditorConfig for VS Code (editorconfig.editorconfig)](https://github.com/editorconfig/editorconfig-vscode)
  - [ESLint (dbaeumer.vscode-eslint)](https://github.com/Microsoft/vscode-eslint)
  - [GitLens (eamodio.gitlens)](https://github.com/eamodio/vscode-gitlens)
  - [markdownlint (davidanson.vscode-markdownlint)](https://github.com/DavidAnson/vscode-markdownlint)
  - [Mocha sidebar (maty.vscode-mocha-sidebar)](https://github.com/maty21/mocha-sidebar)
- TEMPORARY:
  - Create a PAT for the Azure DevOps org ```msazure``` with scope: package(read) and add it as local environment variable.
  ```Powershell
  [Environment]::SetEnvironmentVariable('AZ_DevOps_Read_PAT', '<yourPAT>', [EnvironmentVariableTarget]::User)
  ```
  - Create a PAT in GitHub to read packages, and enable SSO for the microsoft organization. Then run 'npm login --scope=@microsoft --registry=https://npm.pkg.github.com' and provide the PAT as password. This will only be needed until this repo is made public.

If developing on Linux or macOS, you will also need to install `git-lfs`.  (It is prepackaged with the Git installer for Windows.)  Follow the [instructions here](https://docs.github.com/en/github/managing-large-files/installing-git-large-file-storage) for your environment.

## Getting Started

Clone, restore modules, build and run:

```bash
git clone https://github.com/microsoft/powerplatform-cli-wrapper.git
cd powerplatform-cli-wrapper
npm install
gulp ci
```

### How to make GitHub Actions and Build Tools compatible with latest PAC CLI?

After adding any new functionality in PAC CLI, support for relevant parameters/actions needs to be considered on all three repositories.
This will ensure that our CI/CD pipelines are in sync with PAC CLI.

Let's say backup environment supports a new action 'foo' then update:

```bash
export interface BackupEnvironmentParameters {
  credentials: AuthCredentials;
  environment?: HostParameterEntry;
  environmentUrl?: HostParameterEntry;
  environmentId?: HostParameterEntry;
  backupLabel: HostParameterEntry;
  notes: HostParameterEntry;
  foo: HostParameterEntry;
}
```

and also update it in main method

```bash
const pacArgs = ["admin", "backup"];
const validator = new InputValidator(host);

validator.pushInput(pacArgs, "--environment", parameters.environment);
validator.pushInput(pacArgs, "--url", parameters.environmentUrl);
validator.pushInput(pacArgs, "--environment-id", parameters.environmentId);
validator.pushInput(pacArgs, "--label", parameters.backupLabel);
validator.pushInput(pacArgs, "--notes", parameters.notes);
validator.pushInput(pacArgs, "--foo", parameters.foo);
```

Now update the unit test accordingly (mock the input by using test/actions/mock/mockHost.ts)

As a new parameter/action in cli-wrapper is added and merged, update the dist folder by running "npm run dist" and merge it, then run “npm run trigger-pkg-release” which will generate a new version (say 0.1.45) with latest changes and consume it in both PP-BT and GitHub Actions.

Similar changes need to be done in both Build Tools and GitHub Actions to consume the new parameter 'foo'.

Let's take pp-actions, Go to package.json and update cli-wrapper version in line 65.

```bash
"@microsoft/powerplatform-cli-wrapper": "^0.1.45"
```

Run 'npm install'.

Now go to 'src/actions/backup-environment/index.ts' and add foo parameter:

```bash
await backupEnvironment({
    credentials: getCredentials(),
    environment: parameterMap['environment'],
    environmentUrl: parameterMap['environment-url'],
    backupLabel: parameterMap['backup-label'],
    notes: parameterMap['notes'],
    foo: parameterMap['foo'],
}, runnerParameters, new ActionsHost());
```

Also go to 'backup-environment/action.yml' and add a new entry:

```bash
foo:
  description: 'Dummy foo action.'
  required: false
```

Now update the unit test test/bacupEnvironment.test.ts.

Do similar changes also in Build Tools in the specified files -> src/tasks/backup-environment/backup-environment-v0/index.ts, src/tasks/backup-environment/backup-environment-v0/task.json and test/actions/backup-environment.test.ts and nuget.json (line 18, 23).

In pp-actions, After creating a PR with changes in your commit, please update dist folder in a separate commit by running “npm run update-dist” in "./<pp-actions>/"

Run gulp ci in both pp-action or pp-build-tools before creating a pull request.

Note:

1) If you are getting an E401 error then it is likely that your PAT in GitHub expired, if it didn't then try to login again by running 'npm login --scope=@microsoft --registry=https://npm.pkg.github.com' and provide the PAT as password.

2) For Testing before releasing a package on local machine: you can run 'gulp ci' in cli-wrapper after making changes and copy the generated dist folder into ".\<pp-build-tools (or) pp-actions>\node_modules\@microsoft\powerplatform-cli-wrapper"
