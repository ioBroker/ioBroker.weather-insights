"use strict";
/**
 * Pure meteorological formulas. All functions are side-effect free so they can be unit tested.
 * Units: temperature °C, relative humidity %, pressure hPa, wind m/s, altitude m.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = round;
exports.seaLevelPressure = seaLevelPressure;
exports.standardStationPressure = standardStationPressure;
exports.saturationVaporPressure = saturationVaporPressure;
exports.dewPoint = dewPoint;
exports.frostPoint = frostPoint;
exports.absoluteHumidity = absoluteHumidity;
exports.heatIndex = heatIndex;
exports.humidex = humidex;
exports.windChill = windChill;
exports.feelsLike = feelsLike;
exports.beaufort = beaufort;
exports.cloudBase = cloudBase;
exports.angleDiff = angleDiff;
/** Round to the given number of decimals. */
function round(value, decimals = 1) {
    const f = 10 ** decimals;
    return Math.round(value * f) / f;
}
/**
 * Reduce a station (absolute) pressure to mean sea level with the international barometric formula,
 * corrected for the actual air temperature.
 */
function seaLevelPressure(stationHpa, altitudeM, temperatureC = 15) {
    if (!altitudeM) {
        return stationHpa;
    }
    const t = temperatureC + 273.15;
    return stationHpa * Math.pow(1 - (0.0065 * altitudeM) / (t + 0.0065 * altitudeM), -5.257);
}
/** Station pressure of the standard atmosphere (1013.25 hPa at sea level) at the given altitude. */
function standardStationPressure(altitudeM) {
    return 1013.25 * Math.pow(1 - 2.25577e-5 * altitudeM, 5.25588);
}
/** Saturation vapour pressure over water in hPa (Magnus formula, WMO coefficients). */
function saturationVaporPressure(temperatureC) {
    return 6.112 * Math.exp((17.62 * temperatureC) / (243.12 + temperatureC));
}
/** Dew point in °C (Magnus formula over water). */
function dewPoint(temperatureC, humidity) {
    const rh = Math.min(Math.max(humidity, 0.1), 100);
    const gamma = Math.log(rh / 100) + (17.62 * temperatureC) / (243.12 + temperatureC);
    return (243.12 * gamma) / (17.62 - gamma);
}
/** Frost point in °C (Magnus formula over ice). Equal to the dew point above 0 °C. */
function frostPoint(temperatureC, humidity) {
    const td = dewPoint(temperatureC, humidity);
    if (td >= 0) {
        return td;
    }
    const e = (Math.min(Math.max(humidity, 0.1), 100) / 100) * saturationVaporPressure(temperatureC);
    const ln = Math.log(e / 6.112);
    return (272.62 * ln) / (22.46 - ln);
}
/** Absolute humidity in g/m³. */
function absoluteHumidity(temperatureC, humidity) {
    const e = (humidity / 100) * saturationVaporPressure(temperatureC);
    return (216.7 * e) / (273.15 + temperatureC);
}
/**
 * Heat index (apparent temperature for hot and humid air) in °C, NOAA algorithm.
 * Below 27 °C the plain temperature is returned.
 */
function heatIndex(temperatureC, humidity) {
    if (temperatureC < 27) {
        return temperatureC;
    }
    const t = (temperatureC * 9) / 5 + 32;
    const rh = humidity;
    let hi = 0.5 * (t + 61 + (t - 68) * 1.2 + rh * 0.094);
    if (hi >= 80) {
        hi =
            -42.379 +
                2.04901523 * t +
                10.14333127 * rh -
                0.22475541 * t * rh -
                0.00683783 * t * t -
                0.05481717 * rh * rh +
                0.00122874 * t * t * rh +
                0.00085282 * t * rh * rh -
                0.00000199 * t * t * rh * rh;
        if (rh < 13 && t >= 80 && t <= 112) {
            hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
        }
        else if (rh > 85 && t >= 80 && t <= 87) {
            hi += ((rh - 85) / 10) * ((87 - t) / 5);
        }
    }
    return ((hi - 32) * 5) / 9;
}
/** Humidex (Canadian index of felt heat) in °C. */
function humidex(temperatureC, dewPointC) {
    const e = 6.11 * Math.exp(5417.753 * (1 / 273.16 - 1 / (273.15 + dewPointC)));
    return temperatureC + 0.5555 * (e - 10);
}
/**
 * Wind chill in °C (JAG/TI formula). Defined for temperatures up to 10 °C and wind above 4.8 km/h;
 * outside that range the plain temperature is returned.
 */
function windChill(temperatureC, windMs) {
    const v = windMs * 3.6;
    if (temperatureC > 10 || v <= 4.8) {
        return temperatureC;
    }
    const p = Math.pow(v, 0.16);
    return 13.12 + 0.6215 * temperatureC - 11.37 * p + 0.3965 * temperatureC * p;
}
/** Felt temperature: wind chill when cold, heat index when hot, otherwise the air temperature. */
function feelsLike(temperatureC, humidity, windMs) {
    if (temperatureC <= 10 && windMs !== undefined) {
        return windChill(temperatureC, windMs);
    }
    if (temperatureC >= 27 && humidity !== undefined) {
        return heatIndex(temperatureC, humidity);
    }
    return temperatureC;
}
const BEAUFORT_LIMITS = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
/** Beaufort number (0..12) of a wind speed in m/s. */
function beaufort(windMs) {
    let b = 0;
    while (b < BEAUFORT_LIMITS.length && windMs >= BEAUFORT_LIMITS[b]) {
        b++;
    }
    return b;
}
/** Height of the cumulus cloud base above ground in m (Espy's rule, 125 m per K of spread). */
function cloudBase(temperatureC, dewPointC) {
    return Math.max(0, 125 * (temperatureC - dewPointC));
}
/** Signed smallest difference between two directions in degrees: positive = clockwise (veering). */
function angleDiff(fromDeg, toDeg) {
    let d = (toDeg - fromDeg) % 360;
    if (d > 180) {
        d -= 360;
    }
    else if (d < -180) {
        d += 360;
    }
    return d;
}
//# sourceMappingURL=physics.js.map