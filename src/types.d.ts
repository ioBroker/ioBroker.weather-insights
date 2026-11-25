export interface WeatherInsightsConfig {
    pressureId: string;
    /** auto | station | sealevel */
    pressureType: 'auto' | 'station' | 'sealevel';
    temperatureId: string;
    humidityId: string;
    windSpeedId: string;
    windGustId: string;
    /** auto (from the unit of the object) | ms | kmh | mph | kn */
    windUnit: 'auto' | 'ms' | 'kmh' | 'mph' | 'kn';
    windDirectionId: string;
    indoorTemperatureId: string;
    indoorHumidityId: string;
    useSystemLocation: boolean;
    latitude: string | number;
    longitude: string | number;
    /** Altitude of the pressure sensor in m; empty = elevation of the forecast grid cell */
    altitude: string | number;
    forecastEnabled: boolean;
    /** Minutes between two forecast requests */
    forecastInterval: number;
    useHistory: boolean;
    healthEnabled: boolean;
    sensitivity: 'low' | 'normal' | 'high';
    healthDirection: 'both' | 'falling' | 'rising';
}

declare global {
    namespace ioBroker {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface AdapterConfig extends WeatherInsightsConfig {}
    }
}
