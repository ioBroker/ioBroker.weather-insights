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
export declare const HEALTH_WINDOWS: number[];
/** Thresholds of the absolute 6 h change in hPa for the levels 1..4 */
export declare const HEALTH_THRESHOLDS: number[];
export declare const SENSITIVITY_FACTOR: Record<string, number>;
/** Local calendar date of a timestamp for a fixed UTC offset in seconds. */
export declare function dayKey(ts: number, offsetSec: number): string;
/** Level 0..4 from the absolute 6 h change. */
export declare function healthLevel(abs6h: number, factor?: number): number;
/**
 * Analyses one local day. The points must be hourly (full hours) and should include the 24 hours
 * before the day so that windows ending early in the day are complete.
 * A window belongs to the day that holds its middle. Returns null if no 6 h window belongs to the day.
 */
export declare function analyzeDay(points: Point[], date: string, offsetSec: number, factor?: number, direction?: HealthDirection): DayHealth | null;
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
/**
 * Compares the pressure changes on days with and without migraine. With at least 3 migraine days and
 * 14 recorded days it suggests the sensitivity whose "moderate" threshold best separates both groups.
 */
export declare function analyzeDiary(entries: DiaryEntry[]): DiaryAnalysis;
