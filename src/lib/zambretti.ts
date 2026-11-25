/**
 * Zambretti forecaster (Negretti & Zambra, 1915): a short-range local forecast (about 6-12 h)
 * from the sea-level pressure, its 3 h trend, the wind direction and the season.
 * The lookup tables follow the widely used implementation by beteljuice.
 */

export const ZAMBRETTI_FORECASTS = [
    'Settled fine',
    'Fine weather',
    'Becoming fine',
    'Fine, becoming less settled',
    'Fine, possible showers',
    'Fairly fine, improving',
    'Fairly fine, possible showers early',
    'Fairly fine, showery later',
    'Showery early, improving',
    'Changeable, mending',
    'Fairly fine, showers likely',
    'Rather unsettled, clearing later',
    'Unsettled, probably improving',
    'Showery, bright intervals',
    'Showery, becoming less settled',
    'Changeable, some rain',
    'Unsettled, short fine intervals',
    'Unsettled, rain later',
    'Unsettled, some rain',
    'Mostly very unsettled',
    'Occasional rain, worsening',
    'Rain at times, very unsettled',
    'Rain at frequent intervals',
    'Rain, very unsettled',
    'Stormy, may improve',
    'Stormy, much rain',
];

const RISE_OPTIONS = [25, 25, 25, 24, 24, 19, 16, 12, 11, 9, 8, 6, 5, 2, 1, 1, 0, 0, 0, 0, 0, 0];
const STEADY_OPTIONS = [25, 25, 25, 25, 25, 25, 23, 23, 22, 18, 15, 13, 10, 4, 1, 1, 0, 0, 0, 0, 0, 0];
const FALL_OPTIONS = [25, 25, 25, 25, 25, 25, 25, 25, 23, 23, 21, 20, 17, 14, 7, 3, 1, 1, 1, 0, 0, 0];

/** Correction of the pressure in hPa per wind direction (16 points from N clockwise), northern hemisphere. */
const WIND_CORRECTION = [6, 5, 5, 2, -0.5, -2, -5, -8.5, -12, -10, -6, -4.5, -3, -0.5, 1.5, 3];

const BARO_TOP = 1050;
const BARO_BOTTOM = 950;

/** Trend threshold over 3 hours in hPa. */
export const ZAMBRETTI_TREND_HPA = 1.6;

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
export function zambretti(
    pressureHpa: number,
    change3h: number,
    month: number,
    windDirectionDeg?: number,
    southern = false,
): ZambrettiResult {
    const range = BARO_TOP - BARO_BOTTOM;
    let p = pressureHpa;
    const trend = change3h >= ZAMBRETTI_TREND_HPA ? 1 : change3h <= -ZAMBRETTI_TREND_HPA ? -1 : 0;

    if (windDirectionDeg !== undefined && Number.isFinite(windDirectionDeg)) {
        const dir = southern ? (windDirectionDeg + 180) % 360 : windDirectionDeg;
        const point = Math.round((((dir % 360) + 360) % 360) / 22.5) % 16;
        p += (WIND_CORRECTION[point] / 100) * range;
    }

    const summerNorth = month >= 4 && month <= 9;
    const summer = southern ? !summerNorth : summerNorth;
    if (summer) {
        if (trend > 0) {
            p += (7 / 100) * range;
        } else if (trend < 0) {
            p -= (7 / 100) * range;
        }
    }
    if (p >= BARO_TOP) {
        p = BARO_TOP - 1;
    }
    let option = Math.floor((p - BARO_BOTTOM) / (range / 22));
    let exceptional = false;
    if (option < 0) {
        option = 0;
        exceptional = true;
    } else if (option > 21) {
        option = 21;
        exceptional = true;
    }
    const table = trend > 0 ? RISE_OPTIONS : trend < 0 ? FALL_OPTIONS : STEADY_OPTIONS;
    const index = table[option];
    return {
        index,
        letter: String.fromCharCode(65 + index),
        text: ZAMBRETTI_FORECASTS[index],
        exceptional: exceptional || pressureHpa < BARO_BOTTOM || pressureHpa > BARO_TOP,
    };
}
