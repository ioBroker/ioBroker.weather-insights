"use strict";
/**
 * Weather sensitivity (e.g. migraine): how strongly and how fast the pressure changes per day.
 * The thresholds are technical starting values, not medically validated limits.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENSITIVITY_FACTOR = exports.HEALTH_THRESHOLDS = exports.HEALTH_WINDOWS = void 0;
exports.dayKey = dayKey;
exports.healthLevel = healthLevel;
exports.analyzeDay = analyzeDay;
exports.analyzeDiary = analyzeDiary;
const HOUR = 3_600_000;
exports.HEALTH_WINDOWS = [3, 6, 12, 24];
/** Thresholds of the absolute 6 h change in hPa for the levels 1..4 */
exports.HEALTH_THRESHOLDS = [2, 4, 6, 9];
exports.SENSITIVITY_FACTOR = {
    low: 1.3,
    normal: 1,
    high: 0.7,
};
/** Local calendar date of a timestamp for a fixed UTC offset in seconds. */
function dayKey(ts, offsetSec) {
    return new Date(ts + offsetSec * 1000).toISOString().substring(0, 10);
}
/** Level 0..4 from the absolute 6 h change. */
function healthLevel(abs6h, factor = 1) {
    let level = 0;
    while (level < exports.HEALTH_THRESHOLDS.length && abs6h >= exports.HEALTH_THRESHOLDS[level] * factor) {
        level++;
    }
    return level;
}
/**
 * Analyses one local day. The points must be hourly (full hours) and should include the 24 hours
 * before the day so that windows ending early in the day are complete.
 * A window belongs to the day that holds its middle. Returns null if no 6 h window belongs to the day.
 */
function analyzeDay(points, date, offsetSec, factor = 1, direction = 'both') {
    const byTs = new Map();
    for (const p of points) {
        if (Number.isFinite(p.v)) {
            byTs.set(Math.round(p.ts / HOUR) * HOUR, p.v);
        }
    }
    const windows = {};
    for (const w of exports.HEALTH_WINDOWS) {
        let best;
        for (const [ts, v] of byTs) {
            // the window belongs to the day that holds its middle
            if (dayKey(ts - (w * HOUR) / 2, offsetSec) !== date) {
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
function mean(values) {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}
/**
 * Compares the pressure changes on days with and without migraine. With at least 3 migraine days and
 * 14 recorded days it suggests the sensitivity whose "moderate" threshold best separates both groups.
 */
function analyzeDiary(entries) {
    const withValue = entries.filter(e => typeof e.max6h === 'number');
    const mig = withValue.filter(e => e.migraine).map(e => e.max6h);
    const other = withValue.filter(e => !e.migraine).map(e => e.max6h);
    const result = {
        days: withValue.length,
        migraineDays: entries.filter(e => e.migraine).length,
        avgMigraine: mean(mig),
        avgOther: mean(other),
        suggestedSensitivity: null,
    };
    if (mig.length >= 3 && withValue.length >= 14) {
        let bestScore = -Infinity;
        for (const s of ['normal', 'high', 'low']) {
            const threshold = exports.HEALTH_THRESHOLDS[0] * exports.SENSITIVITY_FACTOR[s];
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
//# sourceMappingURL=health.js.map