/**
 * Hourly forecast from Open-Meteo (free, no API key). Includes the past day so that changes
 * over 24 hours can be computed without own sensors.
 */
import type { Point } from './health';
import { SeriesBuffer } from './series';
export type ForecastKey = 'pressure' | 'temperature' | 'humidity' | 'dewPoint' | 'wind' | 'gust' | 'direction' | 'cape';
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
export declare function forecastUrl(latitude: number, longitude: number): string;
interface OpenMeteoResponse {
    utc_offset_seconds?: number;
    elevation?: number;
    hourly?: Record<string, (number | null)[]>;
    reason?: string;
    error?: boolean;
}
export declare function parseForecast(json: OpenMeteoResponse, now?: number): Forecast;
export declare function fetchForecast(latitude: number, longitude: number, timeoutMs?: number): Promise<Forecast>;
/** Hourly points of one variable, optionally limited to a time range. */
export declare function forecastPoints(fc: Forecast, key: ForecastKey, from?: number, to?: number): Point[];
/** A series buffer of the forecast values up to `now` (stand-in when no sensor is configured). */
export declare function forecastBuffer(fc: Forecast, key: ForecastKey, now?: number): SeriesBuffer;
/** Value of a variable at `ts`, interpolated between the hours. */
export declare function forecastValueAt(fc: Forecast, key: ForecastKey, ts: number): number | undefined;
/** Maximum and minimum of a variable in a time range. */
export declare function forecastExtremes(fc: Forecast, key: ForecastKey, from: number, to: number): {
    min: number;
    max: number;
    minTs: number;
    maxTs: number;
} | undefined;
export {};
