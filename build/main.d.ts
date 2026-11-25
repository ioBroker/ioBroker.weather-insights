import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import type { WeatherInsightsConfig } from './types';
export declare class WeatherInsightsAdapter extends Adapter {
    config: WeatherInsightsConfig;
    private lang;
    private locLat;
    private locLon;
    private altitude;
    private altitudeConfigured;
    private pressureIsStation;
    private readonly buffers;
    private readonly inputs;
    private readonly configured;
    private forecast;
    private diary;
    private lastColdFront;
    private biasWarned;
    private computeTimer;
    private forecastTimer;
    private saveTimer;
    private bufferFile;
    private computing;
    constructor(options?: Partial<AdapterOptions>);
    private onReady;
    private onUnload;
    private createObjects;
    private makeConverter;
    /** Pressure reduced to sea level; decides once whether the sensor measures station pressure. */
    private toSeaLevel;
    private currentTemperature;
    private parseValue;
    private addValue;
    private setupInputs;
    /** Loads the last 25 hours of an input from the history instance. */
    private backfill;
    private onStateChange;
    private updateForecast;
    /** UTC offset of the location in seconds (from the forecast, otherwise of this host). */
    private utcOffset;
    /** Series of a quantity: from the sensor if it delivers values, otherwise from the forecast. */
    private series;
    private current;
    private set;
    private formatTime;
    private parseDiary;
    private diaryEntry;
    private markMigraine;
    private writeDiary;
    private updateDiaryAnalysis;
    private saveBuffers;
    private compute;
    private computeAll;
    private computeHealth;
    private writeHealthDay;
}
