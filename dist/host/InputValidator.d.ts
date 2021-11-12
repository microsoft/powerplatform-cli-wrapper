import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";
export declare class InputValidator {
    private _host;
    constructor(host: IHostAbstractions);
    getInput(params: HostParameterEntry): string | undefined;
    pushInput(pacArgs: string[], property: string, paramEntry?: HostParameterEntry, callback?: (val: string) => string): void;
}
