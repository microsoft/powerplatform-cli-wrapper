
export interface IArtifactStore {
  getTempFolder(): string;
  upload(artifactName: string, files: string[]): Promise<void>;
}
