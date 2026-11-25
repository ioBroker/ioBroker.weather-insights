import { type SeriesBuffer } from './series';
/**
 * Fog risk from the spread between temperature and dew point and the wind.
 * 0 none, 1 mist possible (spread <= 3 K), 2 fog possible (<= 2 K, light wind), 3 fog likely (<= 1 K, calm).
 */
export declare function fogRisk(temperatureC: number, dewPointC: number, windMs?: number): number;
/** Mugginess from the dew point: 0 comfortable (< 16 °C), 1 muggy, 2 oppressive (>= 18 °C), 3 very oppressive (>= 21 °C). */
export declare function muggyLevel(dewPointC: number): number;
/** Mould risk from the indoor relative humidity: 0 (< 60 %), 1 (60-70 %), 2 (70-80 %), 3 (>= 80 %). */
export declare function moldRisk(indoorHumidity: number): number;
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
export declare function ventilation(indoorC: number, indoorRh: number, outdoorC: number, outdoorRh: number, marginGm3?: number): Ventilation;
export interface FrostRisk {
    /** 0 none, 1 ground frost possible, 2 frost expected (forecast), 3 frost now */
    level: number;
    /** Hoar frost or black ice possible: near 0 °C and close to saturation */
    iceRisk: boolean;
}
export declare function frostRisk(temperatureC: number, dewPointC?: number, tonightMinC?: number): FrostRisk;
/** Thunderstorm potential from local measurements: 1 muggy and hot, 2 additionally falling pressure. */
export declare function thunderLocal(temperatureC: number, dewPointC: number, change3h?: number): number;
/** Thunderstorm potential from the convective available potential energy (J/kg). */
export declare function capeLevel(cape: number): number;
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
export declare function detectFront(pressure: SeriesBuffer, temperature: SeriesBuffer | undefined, humidity: SeriesBuffer | undefined, direction: SeriesBuffer | undefined, now?: number): FrontResult;
