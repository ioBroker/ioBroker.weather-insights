/**
 * Time series buffer for one measured quantity. Keeps thinned samples of the last hours so that
 * changes over 1..24 h can be computed without the history adapter.
 */
export interface Sample {
    /** Timestamp in ms */
    ts: number;
    /** Value */
    v: number;
}
export declare const MINUTE = 60000;
export declare const HOUR: number;
export declare class SeriesBuffer {
    private readonly maxAgeMs;
    private readonly minSpacingMs;
    private readonly circular;
    samples: Sample[];
    private latest;
    /**
     * @param maxAgeMs samples older than this are dropped
     * @param minSpacingMs a new sample is stored only if the last stored one is at least this old
     * @param circular true for directions in degrees (averaged as vectors)
     */
    constructor(maxAgeMs?: number, minSpacingMs?: number, circular?: boolean);
    add(ts: number, v: number): void;
    prune(now: number): void;
    get size(): number;
    /** Timestamp of the oldest sample, or undefined. */
    get firstTs(): number | undefined;
    /** Most recent value (also when it was not stored because of the spacing). */
    latestValue(maxAgeMs?: number, now?: number): number | undefined;
    /** True if the buffer reaches back at least `ms` before `now` (with 10 min tolerance). */
    covers(ms: number, now?: number): boolean;
    private mean;
    /**
     * Value at time `ts`: the mean of the samples within `windowMs` before `ts` (smooths sensor noise),
     * otherwise linear interpolation between the neighbours if they are less than `maxGapMs` apart.
     */
    valueAt(ts: number, windowMs?: number, maxGapMs?: number): number | undefined;
    /** Change of the value over `ms` up to `now`, or undefined if the buffer does not reach back so far. */
    change(ms: number, now?: number): number | undefined;
    toJSON(): Sample[];
    load(samples: Sample[] | undefined, now?: number): void;
}
