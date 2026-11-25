/**
 * Conclusions from temperature, humidity and wind: fog, mugginess, frost, ventilation, thunderstorms, fronts.
 */
import { absoluteHumidity, angleDiff } from './physics';
import { HOUR, MINUTE, type SeriesBuffer } from './series';

/**
 * Fog risk from the spread between temperature and dew point and the wind.
 * 0 none, 1 mist possible (spread <= 3 K), 2 fog possible (<= 2 K, light wind), 3 fog likely (<= 1 K, calm).
 */
export function fogRisk(temperatureC: number, dewPointC: number, windMs?: number): number {
    const spread = temperatureC - dewPointC;
    const wind = windMs ?? 0;
    if (spread <= 1 && wind <= 2) {
        return 3;
    }
    if (spread <= 2 && wind <= 3) {
        return 2;
    }
    if (spread <= 3 && wind <= 5) {
        return 1;
    }
    return 0;
}

/** Mugginess from the dew point: 0 comfortable (< 16 °C), 1 muggy, 2 oppressive (>= 18 °C), 3 very oppressive (>= 21 °C). */
export function muggyLevel(dewPointC: number): number {
    if (dewPointC >= 21) {
        return 3;
    }
    if (dewPointC >= 18) {
        return 2;
    }
    if (dewPointC >= 16) {
        return 1;
    }
    return 0;
}

/** Mould risk from the indoor relative humidity: 0 (< 60 %), 1 (60-70 %), 2 (70-80 %), 3 (>= 80 %). */
export function moldRisk(indoorHumidity: number): number {
    if (indoorHumidity >= 80) {
        return 3;
    }
    if (indoorHumidity >= 70) {
        return 2;
    }
    if (indoorHumidity >= 60) {
        return 1;
    }
    return 0;
}

export type VentilationAdvice = 'ventilate' | 'neutral' | 'keep-closed';
export type VentilationReason = 'drier' | 'humid' | 'heat' | 'similar';

export interface Ventilation {
    advice: VentilationAdvice;
    reason: VentilationReason;
    /** indoor minus outdoor absolute humidity in g/m³: positive = airing dries the room */
    difference: number;
}

/**
 * Whether opening the windows lowers the indoor humidity: compares the absolute humidity inside and outside.
 * In summer warm outside air is kept out even when it is drier.
 */
export function ventilation(
    indoorC: number,
    indoorRh: number,
    outdoorC: number,
    outdoorRh: number,
    marginGm3 = 1,
): Ventilation {
    const difference = absoluteHumidity(indoorC, indoorRh) - absoluteHumidity(outdoorC, outdoorRh);
    if (outdoorC > indoorC + 1 && indoorC >= 22) {
        return { advice: 'keep-closed', reason: 'heat', difference };
    }
    if (difference >= marginGm3) {
        return { advice: 'ventilate', reason: 'drier', difference };
    }
    if (difference <= -marginGm3) {
        return { advice: 'keep-closed', reason: 'humid', difference };
    }
    return { advice: 'neutral', reason: 'similar', difference };
}

export interface FrostRisk {
    /** 0 none, 1 ground frost possible, 2 frost expected (forecast), 3 frost now */
    level: number;
    /** Hoar frost or black ice possible: near 0 °C and close to saturation */
    iceRisk: boolean;
}

export function frostRisk(temperatureC: number, dewPointC?: number, tonightMinC?: number): FrostRisk {
    let level = 0;
    if (temperatureC <= 0) {
        level = 3;
    } else if (tonightMinC !== undefined && tonightMinC <= 0) {
        level = 2;
    } else if (temperatureC <= 3 || (tonightMinC !== undefined && tonightMinC <= 3)) {
        level = 1;
    } else if (temperatureC <= 5 && dewPointC !== undefined && dewPointC <= 0) {
        level = 1;
    }
    const iceRisk =
        temperatureC >= -5 && temperatureC <= 1 && dewPointC !== undefined && temperatureC - dewPointC <= 1.5;
    return { level, iceRisk };
}

/** Thunderstorm potential from local measurements: 1 muggy and hot, 2 additionally falling pressure. */
export function thunderLocal(temperatureC: number, dewPointC: number, change3h?: number): number {
    if (temperatureC >= 25 && dewPointC >= 16) {
        return change3h !== undefined && change3h <= -1 ? 2 : 1;
    }
    return 0;
}

/** Thunderstorm potential from the convective available potential energy (J/kg). */
export function capeLevel(cape: number): number {
    if (cape >= 2500) {
        return 3;
    }
    if (cape >= 1000) {
        return 2;
    }
    if (cape >= 300) {
        return 1;
    }
    return 0;
}

export type FrontType = 'none' | 'warm' | 'cold';

export interface FrontResult {
    type: FrontType;
    /** Time of the pressure minimum of a cold front passage */
    at?: number;
    /** Wind veered by this many degrees during the passage, if the direction is known */
    veer?: number;
}

/**
 * Detects fronts from the course of the last 3 hours.
 *
 * Cold front: the pressure passed a minimum (fell at least 1 hPa before, rose at least 1 hPa after)
 * and the temperature dropped by 2 K or more since then.
 * Warm front approaching: pressure falls by 1.6 hPa or more in 3 h while the humidity rises
 * by 5 % or more and the temperature does not drop.
 */
export function detectFront(
    pressure: SeriesBuffer,
    temperature: SeriesBuffer | undefined,
    humidity: SeriesBuffer | undefined,
    direction: SeriesBuffer | undefined,
    now = Date.now(),
): FrontResult {
    if (!pressure.covers(3 * HOUR, now)) {
        return { type: 'none' };
    }
    const step = 10 * MINUTE;
    let minTs = 0;
    let minP = Infinity;
    for (let ts = now - 3 * HOUR; ts <= now; ts += step) {
        const p = pressure.valueAt(ts);
        if (p !== undefined && p < minP) {
            minP = p;
            minTs = ts;
        }
    }
    const pNow = pressure.valueAt(now);
    const pStart = pressure.valueAt(now - 3 * HOUR);
    if (
        temperature &&
        pNow !== undefined &&
        pStart !== undefined &&
        minTs > now - 3 * HOUR + 30 * MINUTE &&
        minTs < now - 20 * MINUTE &&
        pStart - minP >= 1 &&
        pNow - minP >= 1
    ) {
        let tMax = -Infinity;
        for (let ts = minTs - HOUR; ts <= minTs; ts += step) {
            const t = temperature.valueAt(ts);
            if (t !== undefined && t > tMax) {
                tMax = t;
            }
        }
        const tNow = temperature.valueAt(now);
        if (tNow !== undefined && tMax - tNow >= 2) {
            let veer: number | undefined;
            if (direction) {
                const before = direction.valueAt(minTs - 30 * MINUTE, 30 * MINUTE);
                const after = direction.valueAt(now, 30 * MINUTE);
                if (before !== undefined && after !== undefined) {
                    veer = angleDiff(before, after);
                }
            }
            return { type: 'cold', at: minTs, veer };
        }
    }
    const change3h = pressure.change(3 * HOUR, now);
    const rh3h = humidity?.change(3 * HOUR, now);
    const t3h = temperature?.change(3 * HOUR, now);
    if (change3h !== undefined && change3h <= -1.6 && rh3h !== undefined && rh3h >= 5 && (t3h ?? 0) >= -0.5) {
        return { type: 'warm' };
    }
    return { type: 'none' };
}
