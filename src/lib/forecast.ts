/**
 * Hourly forecast from Open-Meteo (free, no API key). Includes the past day so that changes
 * over 24 hours can be computed without own sensors.
 */
import type { Point } from './health';
import { SeriesBuffer, HOUR } from './series';

export type ForecastKey = 'pressure' | 'temperature' | 'humidity' | 'dewPoint' | 'wind' | 'gust' | 'direction' | 'cape';

const VARIABLES: Record<ForecastKey, string> = {
    pressure: 'pressure_msl',
    temperature: 'temperature_2m',
    humidity: 'relative_humidity_2m',
    dewPoint: 'dew_point_2m',
    wind: 'wind_speed_10m',
    gust: 'wind_gusts_10m',
    direction: 'wind_direction_10m',
    cape: 'cape',
};

export interface Forecast {
    fetched: number;
    /** UTC offset of the location in seconds */
    offsetSec: number;
    /** Elevation of the model grid cell in m */
    elevation: number;
    /** Hourly timestamps in ms */
    ts: number[];
    values: Record<ForecastKey, (number | null)[]>;
}

export function forecastUrl(latitude: number, longitude: number): string {
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

interface OpenMeteoResponse {
    utc_offset_seconds?: number;
    elevation?: number;
    hourly?: Record<string, (number | null)[]>;
    reason?: string;
    error?: boolean;
}

export function parseForecast(json: OpenMeteoResponse, now = Date.now()): Forecast {
    if (json.error || !json.hourly || !Array.isArray(json.hourly.time)) {
        throw new Error(json.reason || 'Unexpected answer from Open-Meteo');
    }
    const values = {} as Record<ForecastKey, (number | null)[]>;
    for (const [key, name] of Object.entries(VARIABLES) as [ForecastKey, string][]) {
        values[key] = json.hourly[name] || [];
    }
    return {
        fetched: now,
        offsetSec: json.utc_offset_seconds || 0,
        elevation: json.elevation ?? 0,
        ts: (json.hourly.time as number[]).map(t => t * 1000),
        values,
    };
}

export async function fetchForecast(latitude: number, longitude: number, timeoutMs = 20_000): Promise<Forecast> {
    const res = await fetch(forecastUrl(latitude, longitude), {
        headers: { 'User-Agent': 'ioBroker.weather-insights' },
        signal: AbortSignal.timeout(timeoutMs),
    });
    const json = (await res.json()) as OpenMeteoResponse;
    if (!res.ok) {
        throw new Error(`Open-Meteo answered ${res.status}: ${json?.reason || res.statusText}`);
    }
    return parseForecast(json);
}

/** Hourly points of one variable, optionally limited to a time range. */
export function forecastPoints(fc: Forecast, key: ForecastKey, from = -Infinity, to = Infinity): Point[] {
    const out: Point[] = [];
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
export function forecastBuffer(fc: Forecast, key: ForecastKey, now = Date.now()): SeriesBuffer {
    const buf = new SeriesBuffer(30 * HOUR, 0, key === 'direction');
    const points = forecastPoints(fc, key, now - 26 * HOUR, now + HOUR);
    for (const p of points) {
        buf.add(p.ts, p.v);
    }
    return buf;
}

/** Value of a variable at `ts`, interpolated between the hours. */
export function forecastValueAt(fc: Forecast, key: ForecastKey, ts: number): number | undefined {
    const buf = new SeriesBuffer(1000 * HOUR, 0, key === 'direction');
    for (const p of forecastPoints(fc, key, ts - 2 * HOUR, ts + 2 * HOUR)) {
        buf.add(p.ts, p.v);
    }
    return buf.valueAt(ts, 0);
}

/** Maximum and minimum of a variable in a time range. */
export function forecastExtremes(
    fc: Forecast,
    key: ForecastKey,
    from: number,
    to: number,
): { min: number; max: number; minTs: number; maxTs: number } | undefined {
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
