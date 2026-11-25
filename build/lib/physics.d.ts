/**
 * Pure meteorological formulas. All functions are side-effect free so they can be unit tested.
 * Units: temperature °C, relative humidity %, pressure hPa, wind m/s, altitude m.
 */
/** Round to the given number of decimals. */
export declare function round(value: number, decimals?: number): number;
/**
 * Reduce a station (absolute) pressure to mean sea level with the international barometric formula,
 * corrected for the actual air temperature.
 */
export declare function seaLevelPressure(stationHpa: number, altitudeM: number, temperatureC?: number): number;
/** Station pressure of the standard atmosphere (1013.25 hPa at sea level) at the given altitude. */
export declare function standardStationPressure(altitudeM: number): number;
/** Saturation vapour pressure over water in hPa (Magnus formula, WMO coefficients). */
export declare function saturationVaporPressure(temperatureC: number): number;
/** Dew point in °C (Magnus formula over water). */
export declare function dewPoint(temperatureC: number, humidity: number): number;
/** Frost point in °C (Magnus formula over ice). Equal to the dew point above 0 °C. */
export declare function frostPoint(temperatureC: number, humidity: number): number;
/** Absolute humidity in g/m³. */
export declare function absoluteHumidity(temperatureC: number, humidity: number): number;
/**
 * Heat index (apparent temperature for hot and humid air) in °C, NOAA algorithm.
 * Below 27 °C the plain temperature is returned.
 */
export declare function heatIndex(temperatureC: number, humidity: number): number;
/** Humidex (Canadian index of felt heat) in °C. */
export declare function humidex(temperatureC: number, dewPointC: number): number;
/**
 * Wind chill in °C (JAG/TI formula). Defined for temperatures up to 10 °C and wind above 4.8 km/h;
 * outside that range the plain temperature is returned.
 */
export declare function windChill(temperatureC: number, windMs: number): number;
/** Felt temperature: wind chill when cold, heat index when hot, otherwise the air temperature. */
export declare function feelsLike(temperatureC: number, humidity?: number, windMs?: number): number;
/** Beaufort number (0..12) of a wind speed in m/s. */
export declare function beaufort(windMs: number): number;
/** Height of the cumulus cloud base above ground in m (Espy's rule, 125 m per K of spread). */
export declare function cloudBase(temperatureC: number, dewPointC: number): number;
/** Signed smallest difference between two directions in degrees: positive = clockwise (veering). */
export declare function angleDiff(fromDeg: number, toDeg: number): number;
