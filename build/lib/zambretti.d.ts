/**
 * Zambretti forecaster (Negretti & Zambra, 1915): a short-range local forecast (about 6-12 h)
 * from the sea-level pressure, its 3 h trend, the wind direction and the season.
 * The lookup tables follow the widely used implementation by beteljuice.
 */
export declare const ZAMBRETTI_FORECASTS: string[];
/** Trend threshold over 3 hours in hPa. */
export declare const ZAMBRETTI_TREND_HPA = 1.6;
export interface ZambrettiResult {
    /** Index 0..25 into ZAMBRETTI_FORECASTS */
    index: number;
    /** Letter A..Z */
    letter: string;
    /** English forecast text */
    text: string;
    /** Pressure was outside 950..1050 hPa */
    exceptional: boolean;
}
/**
 * @param pressureHpa sea-level pressure
 * @param change3h pressure change over the last 3 hours
 * @param month 1..12
 * @param windDirectionDeg wind direction the wind blows from, optional
 * @param southern true on the southern hemisphere
 */
export declare function zambretti(pressureHpa: number, change3h: number, month: number, windDirectionDeg?: number, southern?: boolean): ZambrettiResult;
