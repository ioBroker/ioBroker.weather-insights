/**
 * Conclusions from the air pressure and its course.
 */
/**
 * Pressure tendency over 3 hours on the scale of the UK Met Office shipping forecast:
 * 0 steady (< 0.1 hPa), ±1 slowly (0.1-1.5), ±2 rising/falling (1.6-3.5), ±3 quickly (3.6-6.0),
 * ±4 very rapidly (> 6.0). Positive = rising.
 */
export declare function tendencyLevel(change3h: number): number;
/**
 * Characteristic of the pressure tendency, WMO code table 0200 (0..8), from the pressure 3 h ago,
 * 1.5 h ago and now.
 *
 * 0 increasing, then decreasing (now same or higher than 3 h ago)
 * 1 increasing, then steady; or increasing, then increasing more slowly
 * 2 increasing steadily
 * 3 decreasing or steady, then increasing; or increasing, then increasing more rapidly
 * 4 steady
 * 5 decreasing, then increasing (now same or lower than 3 h ago)
 * 6 decreasing, then steady; or decreasing, then decreasing more slowly
 * 7 decreasing steadily
 * 8 steady or increasing, then decreasing; or decreasing, then decreasing more rapidly
 */
export declare function wmoCharacteristic(p3h: number, p1h5: number, p0: number, deadband?: number): number;
export type StormReason = '' | 'fall3h' | 'rise3h' | 'bomb' | 'gust';
export interface StormRisk {
    /** 0 none, 1 gale possible, 2 storm likely, 3 severe storm */
    level: number;
    reason: StormReason;
}
/**
 * Storm risk from the pressure course (classic barometer rules of seafaring) and optionally the measured gust.
 *
 * - 3 h fall of 3.6 hPa or more ("falling quickly"): gale possible; 6 hPa: storm likely; 8 hPa: severe storm
 * - 3 h rise of the same size after a low: strong wind behind the cold front ("quick rise after low")
 * - 24 h fall of 24 hPa scaled with sin(latitude)/sin(60°) ("bomb" cyclogenesis): severe storm
 * - measured gusts of Beaufort 8 / 10 / 11 raise the level to 1 / 2 / 3
 */
export declare function stormRisk(opts: {
    change3h?: number;
    change24h?: number;
    latitude?: number;
    gustMs?: number;
}): StormRisk;
