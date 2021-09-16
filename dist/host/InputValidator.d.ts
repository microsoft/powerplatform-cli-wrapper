import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";
export declare class InputValidator {
    private _host;
    constructor(host: IHostAbstractions);
    getInput(params: HostParameterEntry): string | undefined;
    pushInput(pacArgs: string[], property: string, params?: HostParameterEntry, callback?: (val: string) => string): void;
    getBoolInput(params: HostParameterEntry): string;
    getIntInput(params: HostParameterEntry): string;
    isEntryValid(entry?: HostParameterEntry): entry is HostParameterEntry;
}
