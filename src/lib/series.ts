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

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

export class SeriesBuffer {
    public samples: Sample[] = [];
    private latest: Sample | null = null;

    /**
     * @param maxAgeMs samples older than this are dropped
     * @param minSpacingMs a new sample is stored only if the last stored one is at least this old
     * @param circular true for directions in degrees (averaged as vectors)
     */
    constructor(
        private readonly maxAgeMs = 26 * HOUR,
        private readonly minSpacingMs = 5 * MINUTE,
        private readonly circular = false,
    ) {}

    add(ts: number, v: number): void {
        if (!Number.isFinite(v) || !Number.isFinite(ts)) {
            return;
        }
        if (!this.latest || ts >= this.latest.ts) {
            this.latest = { ts, v };
        }
        const last = this.samples[this.samples.length - 1];
        if (last && ts < last.ts) {
            // out of order (e.g. history backfill): insert sorted
            const i = this.samples.findIndex(s => s.ts > ts);
            const prev = this.samples[i - 1];
            if ((!prev || ts - prev.ts >= this.minSpacingMs) && this.samples[i].ts - ts >= this.minSpacingMs) {
                this.samples.splice(i, 0, { ts, v });
            }
            return;
        }
        if (!last || ts - last.ts >= this.minSpacingMs) {
            this.samples.push({ ts, v });
        }
        this.prune(ts);
    }

    prune(now: number): void {
        const limit = now - this.maxAgeMs;
        let i = 0;
        while (i < this.samples.length && this.samples[i].ts < limit) {
            i++;
        }
        if (i) {
            this.samples.splice(0, i);
        }
    }

    get size(): number {
        return this.samples.length;
    }

    /** Timestamp of the oldest sample, or undefined. */
    get firstTs(): number | undefined {
        return this.samples[0]?.ts;
    }

    /** Most recent value (also when it was not stored because of the spacing). */
    latestValue(maxAgeMs = 2 * HOUR, now = Date.now()): number | undefined {
        const s = this.latest || this.samples[this.samples.length - 1];
        if (!s || now - s.ts > maxAgeMs) {
            return undefined;
        }
        return s.v;
    }

    /** True if the buffer reaches back at least `ms` before `now` (with 10 min tolerance). */
    covers(ms: number, now = Date.now()): boolean {
        const first = this.firstTs;
        return first !== undefined && first <= now - ms + 10 * MINUTE;
    }

    private mean(values: number[]): number {
        if (!this.circular) {
            return values.reduce((a, b) => a + b, 0) / values.length;
        }
        let x = 0;
        let y = 0;
        for (const v of values) {
            x += Math.cos((v * Math.PI) / 180);
            y += Math.sin((v * Math.PI) / 180);
        }
        const deg = (Math.atan2(y, x) * 180) / Math.PI;
        return (deg + 360) % 360;
    }

    /**
     * Value at time `ts`: the mean of the samples within `windowMs` before `ts` (smooths sensor noise),
     * otherwise linear interpolation between the neighbours if they are less than `maxGapMs` apart.
     */
    valueAt(ts: number, windowMs = 15 * MINUTE, maxGapMs = 2 * HOUR): number | undefined {
        const all =
            this.latest && this.latest.ts > (this.samples[this.samples.length - 1]?.ts ?? 0)
                ? [...this.samples, this.latest]
                : this.samples;
        if (!all.length) {
            return undefined;
        }
        const inWindow = all.filter(s => s.ts <= ts && s.ts > ts - windowMs).map(s => s.v);
        if (inWindow.length) {
            return this.mean(inWindow);
        }
        let after = -1;
        for (let i = 0; i < all.length; i++) {
            if (all[i].ts > ts) {
                after = i;
                break;
            }
        }
        if (after === 0) {
            // before the first sample
            return all[0].ts - ts <= windowMs ? all[0].v : undefined;
        }
        if (after === -1) {
            // after the last sample: hold the last value while it is not too old
            const last = all[all.length - 1];
            return ts - last.ts <= maxGapMs ? last.v : undefined;
        }
        const a = all[after - 1];
        const b = all[after];
        if (b.ts - a.ts > maxGapMs) {
            return undefined;
        }
        if (this.circular) {
            return (ts - a.ts < b.ts - ts ? a : b).v;
        }
        return a.v + ((b.v - a.v) * (ts - a.ts)) / (b.ts - a.ts);
    }

    /** Change of the value over `ms` up to `now`, or undefined if the buffer does not reach back so far. */
    change(ms: number, now = Date.now()): number | undefined {
        if (!this.covers(ms, now)) {
            return undefined;
        }
        const a = this.valueAt(now - ms);
        const b = this.valueAt(now);
        return a === undefined || b === undefined ? undefined : b - a;
    }

    toJSON(): Sample[] {
        return this.samples;
    }

    load(samples: Sample[] | undefined, now = Date.now()): void {
        this.samples = Array.isArray(samples)
            ? samples.filter(s => s && Number.isFinite(s.ts) && Number.isFinite(s.v)).sort((a, b) => a.ts - b.ts)
            : [];
        this.latest = null;
        this.prune(now);
    }
}
