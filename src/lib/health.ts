/**
 * Weather sensitivity (e.g. migraine): how strongly and how fast the pressure changes per day.
 * The thresholds are technical starting values, not medically validated limits.
 */

export interface Point {
    /** Timestamp in ms (UTC) */
    ts: number;
    v: number;
}

export type HealthDirection = 'both' | 'falling' | 'rising';

export interface WindowChange {
    /** Signed change in hPa of the window with the largest absolute change */
    change: number;
    from: number;
    to: number;
}

export interface DayHealth {
    /** Local date YYYY-MM-DD */
    date: string;
    /** 0 low, 1 moderate, 2 elevated, 3 strong, 4 very strong */
    level: number;
    /** Strongest change within 3, 6, 12 and 24 hours ending on that day */
    windows: Record<number, WindowChange | undefined>;
}

const HOUR = 3_600_000;
export const HEALTH_WINDOWS = [3, 6, 12, 24];
/** Thresholds of the absolute 6 h change in hPa for the levels 1..4 */
export const HEALTH_THRESHOLDS = [2, 4, 6, 9];

export const SENSITIVITY_FACTOR: Record<string, number> = {
    low: 1.3,
    normal: 1,
    high: 0.7,
};

/** Local calendar date of a timestamp for a fixed UTC offset in seconds. */
export function dayKey(ts: number, offsetSec: number): string {
    return new Date(ts + offsetSec * 1000).toISOString().substring(0, 10);
}

/** Level 0..4 from the absolute 6 h change. */
export function healthLevel(abs6h: number, factor = 1): number {
    let level = 0;
    while (level < HEALTH_THRESHOLDS.length && abs6h >= HEALTH_THRESHOLDS[level] * factor) {
        level++;
    }
    return level;
}

/**
 * Analyses one local day. The points must be hourly (full hours) and should include the 24 hours
 * before the day so that windows ending early in the day are complete.
 * Returns null if no 6 h window ends within the day.
 */
export function analyzeDay(
    points: Point[],
    date: string,
    offsetSec: number,
    factor = 1,
    direction: HealthDirection = 'both',
): DayHealth | null {
    const byTs = new Map<number, number>();
    for (const p of points) {
        if (Number.isFinite(p.v)) {
            byTs.set(Math.round(p.ts / HOUR) * HOUR, p.v);
        }
    }
    const windows: Record<number, WindowChange | undefined> = {};
    for (const w of HEALTH_WINDOWS) {
        let best: WindowChange | undefined;
        for (const [ts, v] of byTs) {
            if (dayKey(ts, offsetSec) !== date) {
                continue;
            }
            const start = byTs.get(ts - w * HOUR);
            if (start === undefined) {
                continue;
            }
            const change = v - start;
            if ((direction === 'falling' && change > 0) || (direction === 'rising' && change < 0)) {
                continue;
            }
            if (!best || Math.abs(change) > Math.abs(best.change)) {
                best = { change, from: ts - w * HOUR, to: ts };
            }
        }
        windows[w] = best;
    }
    if (!windows[6]) {
        return null;
    }
    return { date, level: healthLevel(Math.abs(windows[6].change), factor), windows };
}

export interface DiaryEntry {
    date: string;
    /** Largest absolute 6 h change of the day in hPa */
    max6h: number | null;
    migraine: boolean;
}

export interface DiaryAnalysis {
    days: number;
    migraineDays: number;
    /** Mean largest 6 h change on days with migraine */
    avgMigraine: number | null;
    /** Mean largest 6 h change on days without migraine */
    avgOther: number | null;
    /** Sensitivity that matches the diary best, once enough days are recorded */
    suggestedSensitivity: 'low' | 'normal' | 'high' | null;
}

function mean(values: number[]): number | null {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

/**
 * Compares the pressure changes on days with and without migraine. With at least 3 migraine days and
 * 14 recorded days it suggests the sensitivity whose "moderate" threshold best separates both groups.
 */
export function analyzeDiary(entries: DiaryEntry[]): DiaryAnalysis {
    const withValue = entries.filter(e => typeof e.max6h === 'number');
    const mig = withValue.filter(e => e.migraine).map(e => e.max6h as number);
    const other = withValue.filter(e => !e.migraine).map(e => e.max6h as number);
    const result: DiaryAnalysis = {
        days: withValue.length,
        migraineDays: entries.filter(e => e.migraine).length,
        avgMigraine: mean(mig),
        avgOther: mean(other),
        suggestedSensitivity: null,
    };
    if (mig.length >= 3 && withValue.length >= 14) {
        let bestScore = -Infinity;
        for (const s of ['normal', 'high', 'low'] as const) {
            const threshold = HEALTH_THRESHOLDS[0] * SENSITIVITY_FACTOR[s];
            const hits = mig.filter(v => v >= threshold).length / mig.length;
            const falseAlarms = other.length ? other.filter(v => v >= threshold).length / other.length : 0;
            const score = hits - falseAlarms;
            if (score > bestScore) {
                bestScore = score;
                result.suggestedSensitivity = s;
            }
        }
    }
    return result;
}
