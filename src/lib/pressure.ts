/**
 * Conclusions from the air pressure and its course.
 */

/**
 * Pressure tendency over 3 hours on the scale of the UK Met Office shipping forecast:
 * 0 steady (< 0.1 hPa), ±1 slowly (0.1-1.5), ±2 rising/falling (1.6-3.5), ±3 quickly (3.6-6.0),
 * ±4 very rapidly (> 6.0). Positive = rising.
 */
export function tendencyLevel(change3h: number): number {
    const a = Math.abs(change3h);
    let level: number;
    if (a < 0.1) {
        level = 0;
    } else if (a < 1.6) {
        level = 1;
    } else if (a < 3.6) {
        level = 2;
    } else if (a <= 6.0) {
        level = 3;
    } else {
        level = 4;
    }
    return change3h < 0 ? -level : level;
}

function sign(x: number, deadband: number): number {
    if (x > deadband) {
        return 1;
    }
    if (x < -deadband) {
        return -1;
    }
    return 0;
}

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
export function wmoCharacteristic(p3h: number, p1h5: number, p0: number, deadband = 0.1): number {
    const d1 = p1h5 - p3h;
    const d2 = p0 - p1h5;
    const total = p0 - p3h;
    const s1 = sign(d1, deadband / 2);
    const s2 = sign(d2, deadband / 2);
    if (s1 > 0 && s2 < 0) {
        return total >= 0 ? 0 : 8;
    }
    if (s1 < 0 && s2 > 0) {
        return total <= 0 ? 5 : 3;
    }
    if (Math.abs(total) < deadband) {
        return 4;
    }
    if (total > 0) {
        if (s2 === 0) {
            return 1;
        }
        if (s1 === 0) {
            return 3;
        }
        if (d2 > d1 * 1.5) {
            return 3;
        }
        if (d2 * 1.5 < d1) {
            return 1;
        }
        return 2;
    }
    if (s2 === 0) {
        return 6;
    }
    if (s1 === 0) {
        return 8;
    }
    if (-d2 > -d1 * 1.5) {
        return 8;
    }
    if (-d2 * 1.5 < -d1) {
        return 6;
    }
    return 7;
}

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
export function stormRisk(opts: {
    change3h?: number;
    change24h?: number;
    latitude?: number;
    gustMs?: number;
}): StormRisk {
    let level = 0;
    let reason: StormReason = '';
    const raise = (l: number, r: StormReason): void => {
        if (l > level) {
            level = l;
            reason = r;
        }
    };
    const c3 = opts.change3h;
    if (c3 !== undefined) {
        if (c3 <= -8) {
            raise(3, 'fall3h');
        } else if (c3 <= -6) {
            raise(2, 'fall3h');
        } else if (c3 <= -3.6) {
            raise(1, 'fall3h');
        }
        if (c3 >= 6) {
            raise(2, 'rise3h');
        } else if (c3 >= 3.6) {
            raise(1, 'rise3h');
        }
    }
    if (opts.change24h !== undefined) {
        const lat = Math.min(Math.max(Math.abs(opts.latitude ?? 50), 20), 90);
        const bomb = (24 * Math.sin((lat * Math.PI) / 180)) / Math.sin(Math.PI / 3);
        if (opts.change24h <= -bomb) {
            raise(3, 'bomb');
        } else if (opts.change24h <= -bomb * 0.6) {
            raise(2, 'bomb');
        }
    }
    if (opts.gustMs !== undefined) {
        if (opts.gustMs >= 28.5) {
            raise(3, 'gust');
        } else if (opts.gustMs >= 20.8) {
            raise(2, 'gust');
        } else if (opts.gustMs >= 17.2) {
            raise(1, 'gust');
        }
    }
    return { level, reason };
}
