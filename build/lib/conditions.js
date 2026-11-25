"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fogRisk = fogRisk;
exports.muggyLevel = muggyLevel;
exports.moldRisk = moldRisk;
exports.ventilation = ventilation;
exports.frostRisk = frostRisk;
exports.thunderLocal = thunderLocal;
exports.capeLevel = capeLevel;
exports.detectFront = detectFront;
/**
 * Conclusions from temperature, humidity and wind: fog, mugginess, frost, ventilation, thunderstorms, fronts.
 */
const physics_1 = require("./physics");
const series_1 = require("./series");
/**
 * Fog risk from the spread between temperature and dew point and the wind.
 * 0 none, 1 mist possible (spread <= 3 K), 2 fog possible (<= 2 K, light wind), 3 fog likely (<= 1 K, calm).
 */
function fogRisk(temperatureC, dewPointC, windMs) {
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
function muggyLevel(dewPointC) {
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
function moldRisk(indoorHumidity) {
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
/**
 * Whether opening the windows lowers the indoor humidity: compares the absolute humidity inside and outside.
 * In summer warm outside air is kept out even when it is drier.
 */
function ventilation(indoorC, indoorRh, outdoorC, outdoorRh, marginGm3 = 1) {
    const difference = (0, physics_1.absoluteHumidity)(indoorC, indoorRh) - (0, physics_1.absoluteHumidity)(outdoorC, outdoorRh);
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
function frostRisk(temperatureC, dewPointC, tonightMinC) {
    let level = 0;
    if (temperatureC <= 0) {
        level = 3;
    }
    else if (tonightMinC !== undefined && tonightMinC <= 0) {
        level = 2;
    }
    else if (temperatureC <= 3 || (tonightMinC !== undefined && tonightMinC <= 3)) {
        level = 1;
    }
    else if (temperatureC <= 5 && dewPointC !== undefined && dewPointC <= 0) {
        level = 1;
    }
    const iceRisk = temperatureC >= -5 && temperatureC <= 1 && dewPointC !== undefined && temperatureC - dewPointC <= 1.5;
    return { level, iceRisk };
}
/** Thunderstorm potential from local measurements: 1 muggy and hot, 2 additionally falling pressure. */
function thunderLocal(temperatureC, dewPointC, change3h) {
    if (temperatureC >= 25 && dewPointC >= 16) {
        return change3h !== undefined && change3h <= -1 ? 2 : 1;
    }
    return 0;
}
/** Thunderstorm potential from the convective available potential energy (J/kg). */
function capeLevel(cape) {
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
/**
 * Detects fronts from the course of the last 3 hours.
 *
 * Cold front: the pressure passed a minimum (fell at least 1 hPa before, rose at least 1 hPa after)
 * and the temperature dropped by 2 K or more since then.
 * Warm front approaching: pressure falls by 1.6 hPa or more in 3 h while the humidity rises
 * by 5 % or more and the temperature does not drop.
 */
function detectFront(pressure, temperature, humidity, direction, now = Date.now()) {
    if (!pressure.covers(3 * series_1.HOUR, now)) {
        return { type: 'none' };
    }
    const step = 10 * series_1.MINUTE;
    let minTs = 0;
    let minP = Infinity;
    for (let ts = now - 3 * series_1.HOUR; ts <= now; ts += step) {
        const p = pressure.valueAt(ts);
        if (p !== undefined && p < minP) {
            minP = p;
            minTs = ts;
        }
    }
    const pNow = pressure.valueAt(now);
    const pStart = pressure.valueAt(now - 3 * series_1.HOUR);
    if (temperature &&
        pNow !== undefined &&
        pStart !== undefined &&
        minTs > now - 3 * series_1.HOUR + 30 * series_1.MINUTE &&
        minTs < now - 20 * series_1.MINUTE &&
        pStart - minP >= 1 &&
        pNow - minP >= 1) {
        let tMax = -Infinity;
        for (let ts = minTs - series_1.HOUR; ts <= minTs; ts += step) {
            const t = temperature.valueAt(ts);
            if (t !== undefined && t > tMax) {
                tMax = t;
            }
        }
        const tNow = temperature.valueAt(now);
        if (tNow !== undefined && tMax - tNow >= 2) {
            let veer;
            if (direction) {
                const before = direction.valueAt(minTs - 30 * series_1.MINUTE, 30 * series_1.MINUTE);
                const after = direction.valueAt(now, 30 * series_1.MINUTE);
                if (before !== undefined && after !== undefined) {
                    veer = (0, physics_1.angleDiff)(before, after);
                }
            }
            return { type: 'cold', at: minTs, veer };
        }
    }
    const change3h = pressure.change(3 * series_1.HOUR, now);
    const rh3h = humidity?.change(3 * series_1.HOUR, now);
    const t3h = temperature?.change(3 * series_1.HOUR, now);
    if (change3h !== undefined && change3h <= -1.6 && rh3h !== undefined && rh3h >= 5 && (t3h ?? 0) >= -0.5) {
        return { type: 'warm' };
    }
    return { type: 'none' };
}
//# sourceMappingURL=conditions.js.map