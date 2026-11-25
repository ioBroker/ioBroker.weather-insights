"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastUrl = forecastUrl;
exports.parseForecast = parseForecast;
exports.fetchForecast = fetchForecast;
exports.forecastPoints = forecastPoints;
exports.forecastBuffer = forecastBuffer;
exports.forecastValueAt = forecastValueAt;
exports.forecastExtremes = forecastExtremes;
const series_1 = require("./series");
const VARIABLES = {
    pressure: 'pressure_msl',
    temperature: 'temperature_2m',
    humidity: 'relative_humidity_2m',
    dewPoint: 'dew_point_2m',
    wind: 'wind_speed_10m',
    gust: 'wind_gusts_10m',
    direction: 'wind_direction_10m',
    cape: 'cape',
};
function forecastUrl(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        hourly: Object.values(VARIABLES).join(','),
        timezone: 'auto',
        timeformat: 'unixtime',
        wind_speed_unit: 'ms',
        past_days: '1',
        forecast_days: '3',
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}
function parseForecast(json, now = Date.now()) {
    if (json.error || !json.hourly || !Array.isArray(json.hourly.time)) {
        throw new Error(json.reason || 'Unexpected answer from Open-Meteo');
    }
    const values = {};
    for (const [key, name] of Object.entries(VARIABLES)) {
        values[key] = json.hourly[name] || [];
    }
    return {
        fetched: now,
        offsetSec: json.utc_offset_seconds || 0,
        elevation: json.elevation ?? 0,
        ts: json.hourly.time.map(t => t * 1000),
        values,
    };
}
async function fetchForecast(latitude, longitude, timeoutMs = 20_000) {
    const res = await fetch(forecastUrl(latitude, longitude), {
        headers: { 'User-Agent': 'ioBroker.weather-insights' },
        signal: AbortSignal.timeout(timeoutMs),
    });
    const json = (await res.json());
    if (!res.ok) {
        throw new Error(`Open-Meteo answered ${res.status}: ${json?.reason || res.statusText}`);
    }
    return parseForecast(json);
}
/** Hourly points of one variable, optionally limited to a time range. */
function forecastPoints(fc, key, from = -Infinity, to = Infinity) {
    const out = [];
    const arr = fc.values[key];
    for (let i = 0; i < fc.ts.length; i++) {
        const v = arr[i];
        if (typeof v === 'number' && fc.ts[i] >= from && fc.ts[i] <= to) {
            out.push({ ts: fc.ts[i], v });
        }
    }
    return out;
}
/** A series buffer of the forecast values up to `now` (stand-in when no sensor is configured). */
function forecastBuffer(fc, key, now = Date.now()) {
    const buf = new series_1.SeriesBuffer(30 * series_1.HOUR, 0, key === 'direction');
    const points = forecastPoints(fc, key, now - 26 * series_1.HOUR, now + series_1.HOUR);
    for (const p of points) {
        buf.add(p.ts, p.v);
    }
    return buf;
}
/** Value of a variable at `ts`, interpolated between the hours. */
function forecastValueAt(fc, key, ts) {
    const buf = new series_1.SeriesBuffer(1000 * series_1.HOUR, 0, key === 'direction');
    for (const p of forecastPoints(fc, key, ts - 2 * series_1.HOUR, ts + 2 * series_1.HOUR)) {
        buf.add(p.ts, p.v);
    }
    return buf.valueAt(ts, 0);
}
/** Maximum and minimum of a variable in a time range. */
function forecastExtremes(fc, key, from, to) {
    const points = forecastPoints(fc, key, from, to);
    if (!points.length) {
        return undefined;
    }
    let min = points[0];
    let max = points[0];
    for (const p of points) {
        if (p.v < min.v) {
            min = p;
        }
        if (p.v > max.v) {
            max = p;
        }
    }
    return { min: min.v, max: max.v, minTs: min.ts, maxTs: max.ts };
}
//# sourceMappingURL=forecast.js.map