/**
 * Definitions of the states the adapter writes. Created on start, so there is one place to look them up.
 */
export interface StateDef {
    id: string;
    name: string;
    type: ioBroker.CommonType;
    role: string;
    unit?: string;
    write?: boolean;
    states?: Record<string, string>;
    min?: number;
    max?: number;
    def?: ioBroker.StateValue;
}
export declare const CHANNELS: Record<string, string>;
export declare const STATES: StateDef[];
