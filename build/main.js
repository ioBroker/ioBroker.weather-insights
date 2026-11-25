"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherInsightsAdapter = void 0;
const adapter_core_1 = require("@iobroker/adapter-core");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const physics_1 = require("./lib/physics");
const series_1 = require("./lib/series");
const pressure_1 = require("./lib/pressure");
const zambretti_1 = require("./lib/zambretti");
const conditions_1 = require("./lib/conditions");
const health_1 = require("./lib/health");
const forecast_1 = require("./lib/forecast");
const objects_1 = require("./lib/objects");
const texts_1 = require("./lib/texts");
const QUANTITIES = [
    'pressure',
    'temperature',
    'humidity',
    'wind',
    'gust',
    'direction',
    'indoorTemperature',
    'indoorHumidity',
];
const CONFIG_ID = {
    pressure: 'pressureId',
    temperature: 'temperatureId',
    humidity: 'humidityId',
    wind: 'windSpeedId',
    gust: 'windGustId',
    direction: 'windDirectionId',
    indoorTemperature: 'indoorTemperatureId',
    indoorHumidity: 'indoorHumidityId',
};
/** Forecast variable that stands in when no sensor is configured */
const FORECAST_KEY = {
    pressure: 'pressure',
    temperature: 'temperature',
    humidity: 'humidity',
    wind: 'wind',
    gust: 'gust',
    direction: 'direction',
};
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const COMPASS_DE = {
    O: 'E',
    NO: 'NE',
    SO: 'SE',
    ONO: 'ENE',
    OSO: 'ESE',
    NNO: 'NNE',
    SSO: 'SSE',
};
const DIARY_MAX_DAYS = 400;
class WeatherInsightsAdapter extends adapter_core_1.Adapter {
    lang = 'en';
    locLat;
    locLon;
    altitude = 0;
    altitudeConfigured = false;
    pressureIsStation;
    buffers;
    inputs = new Map();
    configured = new Set();
    forecast = null;
    diary = [];
    lastColdFront = 0;
    biasWarned = false;
    computeTimer;
    forecastTimer;
    saveTimer;
    bufferFile = '';
    computing = false;
    constructor(options = {}) {
        super({ ...options, name: 'weather-insights' });
        this.buffers = {};
        for (const q of QUANTITIES) {
            this.buffers[q] = new series_1.SeriesBuffer(26 * series_1.HOUR, 5 * series_1.MINUTE, q === 'direction');
        }
        this.on('ready', () => this.onReady());
        this.on('stateChange', (id, state) => this.onStateChange(id, state));
        this.on('unload', cb => this.onUnload(cb));
    }
    async onReady() {
        const sysConfig = await this.getForeignObjectAsync('system.config');
        this.lang = sysConfig?.common?.language === 'de' ? 'de' : 'en';
        await this.createObjects();
        // location
        const lat = this.config.useSystemLocation ? sysConfig?.common?.latitude : this.config.latitude;
        const lon = this.config.useSystemLocation ? sysConfig?.common?.longitude : this.config.longitude;
        const latN = parseFloat(String(lat ?? ''));
        const lonN = parseFloat(String(lon ?? ''));
        if (Number.isFinite(latN) && Number.isFinite(lonN) && Math.abs(latN) <= 90 && Math.abs(lonN) <= 180) {
            this.locLat = latN;
            this.locLon = lonN;
        }
        else if (this.config.forecastEnabled) {
            this.log.warn('No valid location: set latitude and longitude in the system settings or in the instance. The forecast is disabled.');
        }
        const alt = parseFloat(String(this.config.altitude ?? ''));
        if (Number.isFinite(alt)) {
            this.altitude = alt;
            this.altitudeConfigured = true;
        }
        if (this.config.pressureType === 'station') {
            this.pressureIsStation = true;
        }
        else if (this.config.pressureType === 'sealevel') {
            this.pressureIsStation = false;
        }
        // persisted buffers
        try {
            const dir = (0, adapter_core_1.getAbsoluteInstanceDataDir)(this);
            if (!(0, node_fs_1.existsSync)(dir)) {
                (0, node_fs_1.mkdirSync)(dir, { recursive: true });
            }
            this.bufferFile = (0, node_path_1.join)(dir, 'buffer.json');
            if ((0, node_fs_1.existsSync)(this.bufferFile)) {
                const data = JSON.parse((0, node_fs_1.readFileSync)(this.bufferFile, 'utf8'));
                for (const q of QUANTITIES) {
                    this.buffers[q].load(data.series?.[q]);
                }
            }
        }
        catch (e) {
            this.log.warn(`Cannot read the stored course of the values: ${e.message}`);
        }
        // diary
        const diaryState = await this.getStateAsync('health.diary');
        this.diary = this.parseDiary(diaryState?.val);
        const coldFront = await this.getStateAsync('front.lastColdFront');
        this.lastColdFront = typeof coldFront?.val === 'number' ? coldFront.val : 0;
        if (this.config.forecastEnabled && this.locLat !== undefined) {
            await this.updateForecast();
            const minutes = Math.max(15, Math.min(360, Number(this.config.forecastInterval) || 60));
            this.forecastTimer = this.setInterval(() => void this.updateForecast(), minutes * series_1.MINUTE);
        }
        else {
            await this.setStateAsync('info.connection', false, true);
        }
        await this.setupInputs();
        this.subscribeStates('health.migraineToday');
        this.subscribeStates('health.migraineYesterday');
        this.subscribeStates('health.diary');
        await this.compute();
        this.computeTimer = this.setInterval(() => void this.compute(), series_1.MINUTE);
        this.saveTimer = this.setInterval(() => this.saveBuffers(), 10 * series_1.MINUTE);
    }
    onUnload(callback) {
        try {
            this.computeTimer && this.clearInterval(this.computeTimer);
            this.forecastTimer && this.clearInterval(this.forecastTimer);
            this.saveTimer && this.clearInterval(this.saveTimer);
            this.saveBuffers();
        }
        finally {
            callback();
        }
    }
    async createObjects() {
        for (const [id, name] of Object.entries(objects_1.CHANNELS)) {
            await this.extendObjectAsync(id, { type: 'channel', common: { name }, native: {} });
        }
        for (const def of objects_1.STATES) {
            const common = {
                name: def.name,
                type: def.type,
                role: def.role,
                read: true,
                write: !!def.write,
            };
            if (def.unit) {
                common.unit = def.unit;
            }
            if (def.states) {
                common.states = def.states;
            }
            if (def.min !== undefined) {
                common.min = def.min;
            }
            if (def.max !== undefined) {
                common.max = def.max;
            }
            if (def.def !== undefined) {
                common.def = def.def;
            }
            await this.extendObjectAsync(def.id, { type: 'state', common, native: {} });
        }
    }
    // ---------------------------------------------------------------- inputs
    makeConverter(qty, obj) {
        const unit = String(obj?.common?.unit || '')
            .trim()
            .toLowerCase();
        switch (qty) {
            case 'pressure': {
                let factor = 1;
                if (unit === 'pa') {
                    factor = 0.01;
                }
                else if (unit === 'kpa') {
                    factor = 10;
                }
                else if (unit === 'inhg') {
                    factor = 33.8639;
                }
                else if (unit === 'mmhg' || unit === 'torr') {
                    factor = 1.33322;
                }
                else if (unit === 'bar') {
                    factor = 1000;
                }
                return v => {
                    let hpa = v * factor;
                    if (factor === 1 && hpa > 20000) {
                        hpa /= 100; // Pa without unit
                    }
                    if (hpa < 300 || hpa > 1200) {
                        return undefined;
                    }
                    return this.toSeaLevel(hpa);
                };
            }
            case 'temperature':
            case 'indoorTemperature': {
                if (unit === '°f' || unit === 'f' || unit === 'fahrenheit') {
                    return v => ((v - 32) * 5) / 9;
                }
                if (unit === 'k' || unit === 'kelvin') {
                    return v => v - 273.15;
                }
                return v => (v < -90 || v > 70 ? undefined : v);
            }
            case 'humidity':
            case 'indoorHumidity':
                return v => {
                    const rh = unit !== '%' && v > 0 && v <= 1 ? v * 100 : v;
                    return rh < 0 || rh > 100 ? undefined : rh;
                };
            case 'wind':
            case 'gust': {
                let setting = this.config.windUnit || 'auto';
                if (setting === 'auto') {
                    if (unit === 'km/h' || unit === 'kmh' || unit === 'kph') {
                        setting = 'kmh';
                    }
                    else if (unit === 'mph') {
                        setting = 'mph';
                    }
                    else if (unit === 'kn' || unit === 'kt' || unit === 'kts' || unit === 'knots') {
                        setting = 'kn';
                    }
                    else {
                        setting = 'ms';
                    }
                }
                const factor = { ms: 1, kmh: 1 / 3.6, mph: 0.44704, kn: 0.514444 }[setting] ?? 1;
                return v => (v < 0 ? undefined : v * factor);
            }
            case 'direction':
                return v => ((v % 360) + 360) % 360;
        }
    }
    /** Pressure reduced to sea level; decides once whether the sensor measures station pressure. */
    toSeaLevel(hpa) {
        if (this.pressureIsStation === undefined) {
            const fcNow = this.forecast ? (0, forecast_1.forecastValueAt)(this.forecast, 'pressure', Date.now()) : undefined;
            const reduced = (0, physics_1.seaLevelPressure)(hpa, this.altitude, this.currentTemperature());
            if (fcNow !== undefined && this.altitude > 0) {
                this.pressureIsStation = Math.abs(reduced - fcNow) < Math.abs(hpa - fcNow);
            }
            else {
                const expected = (0, physics_1.standardStationPressure)(this.altitude);
                this.pressureIsStation = this.altitude > 0 && Math.abs(hpa - expected) < Math.abs(hpa - 1013.25);
            }
            this.log.info(`The pressure sensor seems to measure ${this.pressureIsStation ? `the station pressure; it is reduced to sea level for ${this.altitude} m` : 'the sea-level pressure'}. Set the pressure type in the instance settings if this is wrong.`);
        }
        return this.pressureIsStation ? (0, physics_1.seaLevelPressure)(hpa, this.altitude, this.currentTemperature()) : hpa;
    }
    currentTemperature() {
        return this.current('temperature') ?? 15;
    }
    parseValue(qty, val) {
        if (typeof val === 'number') {
            return val;
        }
        if (typeof val === 'string') {
            const s = val.trim().toUpperCase();
            if (qty === 'direction') {
                const i = COMPASS.indexOf(COMPASS_DE[s] || s);
                if (i >= 0) {
                    return i * 22.5;
                }
            }
            const n = parseFloat(s.replace(',', '.'));
            return Number.isFinite(n) ? n : undefined;
        }
        return undefined;
    }
    addValue(input, state) {
        if (!state || state.val === null || state.val === undefined) {
            return;
        }
        const raw = this.parseValue(input.qty, state.val);
        if (raw === undefined) {
            return;
        }
        const v = input.convert(raw);
        if (v === undefined) {
            this.log.debug(`Implausible value ${state.val} of ${input.id} ignored`);
            return;
        }
        this.buffers[input.qty].add(state.ts || Date.now(), v);
    }
    async setupInputs() {
        const sysConfig = await this.getForeignObjectAsync('system.config');
        const defaultHistory = sysConfig?.common?.defaultHistory || '';
        for (const qty of QUANTITIES) {
            const id = String(this.config[CONFIG_ID[qty]] || '').trim();
            if (!id) {
                continue;
            }
            const obj = await this.getForeignObjectAsync(id);
            if (!obj) {
                this.log.warn(`The state ${id} configured for ${qty} does not exist`);
                continue;
            }
            const input = { qty, id, convert: this.makeConverter(qty, obj) };
            const list = this.inputs.get(id) || [];
            list.push(input);
            this.inputs.set(id, list);
            this.configured.add(qty);
            if (this.config.useHistory && defaultHistory && !this.buffers[qty].covers(24 * series_1.HOUR)) {
                const custom = obj.common.custom;
                if (custom?.[defaultHistory]?.enabled) {
                    await this.backfill(input, defaultHistory);
                }
            }
            this.addValue(input, await this.getForeignStateAsync(id));
            await this.subscribeForeignStatesAsync(id);
        }
    }
    /** Loads the last 25 hours of an input from the history instance. */
    async backfill(input, historyInstance) {
        const end = Date.now();
        try {
            const res = (await this.sendToAsync(historyInstance, 'getHistory', {
                id: input.id,
                options: {
                    start: end - 25 * series_1.HOUR,
                    end,
                    aggregate: 'average',
                    step: 5 * series_1.MINUTE,
                    ignoreNull: true,
                },
            }, { timeout: 20_000 }));
            const rows = res?.result || [];
            for (const row of rows) {
                this.addValue(input, { val: row.val, ts: row.ts });
            }
            this.log.info(`Loaded ${rows.length} values of ${input.id} from ${historyInstance}`);
        }
        catch (e) {
            this.log.debug(`Cannot load the history of ${input.id}: ${e.message}`);
        }
    }
    async onStateChange(id, state) {
        const inputs = this.inputs.get(id);
        if (inputs) {
            for (const input of inputs) {
                this.addValue(input, state);
            }
            return;
        }
        if (!state || state.ack) {
            return;
        }
        const local = id.substring(this.namespace.length + 1);
        const now = Date.now();
        if (local === 'health.migraineToday' && state.val) {
            this.markMigraine((0, health_1.dayKey)(now, this.utcOffset()));
            await this.setStateAsync(local, false, true);
            await this.writeDiary();
        }
        else if (local === 'health.migraineYesterday' && state.val) {
            this.markMigraine((0, health_1.dayKey)(now - 24 * series_1.HOUR, this.utcOffset()));
            await this.setStateAsync(local, false, true);
            await this.writeDiary();
        }
        else if (local === 'health.diary') {
            this.diary = this.parseDiary(state.val);
            await this.writeDiary();
        }
    }
    // ---------------------------------------------------------------- forecast
    async updateForecast() {
        if (this.locLat === undefined || this.locLon === undefined) {
            return;
        }
        try {
            this.forecast = await (0, forecast_1.fetchForecast)(this.locLat, this.locLon);
            if (!this.altitudeConfigured) {
                this.altitude = this.forecast.elevation;
            }
            await this.setStateAsync('info.forecastTime', this.forecast.fetched, true);
            await this.setStateChangedAsync('info.connection', true, true);
        }
        catch (e) {
            this.log.warn(`Cannot get the forecast from Open-Meteo: ${e.message}`);
            await this.setStateChangedAsync('info.connection', false, true);
            if (this.forecast && Date.now() - this.forecast.fetched > 6 * series_1.HOUR) {
                this.forecast = null;
            }
        }
    }
    /** UTC offset of the location in seconds (from the forecast, otherwise of this host). */
    utcOffset() {
        return this.forecast ? this.forecast.offsetSec : -new Date().getTimezoneOffset() * 60;
    }
    // ---------------------------------------------------------------- helpers
    /** Series of a quantity: from the sensor if it delivers values, otherwise from the forecast. */
    series(qty, now = Date.now()) {
        const buf = this.buffers[qty];
        if (this.configured.has(qty) && buf.latestValue(2 * series_1.HOUR, now) !== undefined) {
            return { buffer: buf, source: 'sensor' };
        }
        const key = FORECAST_KEY[qty];
        if (key && this.forecast) {
            return { buffer: (0, forecast_1.forecastBuffer)(this.forecast, key, now), source: 'forecast' };
        }
        return undefined;
    }
    current(qty, now = Date.now()) {
        const s = this.series(qty, now);
        return s?.buffer.valueAt(now);
    }
    async set(id, val, decimals = 1) {
        let v = val === undefined ? null : val;
        if (typeof v === 'number') {
            v = Number.isFinite(v) ? (0, physics_1.round)(v, decimals) : null;
        }
        await this.setStateChangedAsync(id, v, true);
    }
    formatTime(ts) {
        return new Date(ts + this.utcOffset() * 1000).toISOString().substring(11, 16);
    }
    parseDiary(val) {
        try {
            const arr = JSON.parse(String(val || '[]'));
            if (Array.isArray(arr)) {
                return arr
                    .filter(e => e && typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
                    .map(e => ({
                    date: e.date,
                    max6h: typeof e.max6h === 'number' ? e.max6h : null,
                    migraine: !!e.migraine,
                }))
                    .sort((a, b) => a.date.localeCompare(b.date));
            }
        }
        catch {
            this.log.warn('The diary (health.diary) is no valid JSON and was reset');
        }
        return [];
    }
    diaryEntry(date) {
        let entry = this.diary.find(e => e.date === date);
        if (!entry) {
            entry = { date, max6h: null, migraine: false };
            this.diary.push(entry);
            this.diary.sort((a, b) => a.date.localeCompare(b.date));
            if (this.diary.length > DIARY_MAX_DAYS) {
                this.diary.splice(0, this.diary.length - DIARY_MAX_DAYS);
            }
        }
        return entry;
    }
    markMigraine(date) {
        this.diaryEntry(date).migraine = true;
        this.log.info(`Migraine recorded for ${date}`);
    }
    async writeDiary() {
        await this.setStateAsync('health.diary', JSON.stringify(this.diary), true);
        await this.updateDiaryAnalysis();
    }
    async updateDiaryAnalysis() {
        const a = (0, health_1.analyzeDiary)(this.diary);
        const text = a.suggestedSensitivity
            ? (0, texts_1.t)('health.analysis.result', this.lang, {
                days: a.days,
                mig: a.migraineDays,
                avgMig: a.avgMigraine === null ? '-' : (0, physics_1.round)(a.avgMigraine, 1),
                avgOther: a.avgOther === null ? '-' : (0, physics_1.round)(a.avgOther, 1),
                sens: (0, texts_1.t)(`sensitivity.${a.suggestedSensitivity}`, this.lang),
            })
            : (0, texts_1.t)('health.analysis.few', this.lang, { days: a.days, mig: a.migraineDays });
        await this.set('health.analysis', text);
        await this.set('health.suggestedSensitivity', a.suggestedSensitivity);
    }
    saveBuffers() {
        if (!this.bufferFile) {
            return;
        }
        try {
            const data = { version: 1, series: {} };
            for (const q of QUANTITIES) {
                if (this.buffers[q].size) {
                    data.series[q] = this.buffers[q].toJSON();
                }
            }
            (0, node_fs_1.writeFileSync)(this.bufferFile, JSON.stringify(data));
        }
        catch (e) {
            this.log.warn(`Cannot store the course of the values: ${e.message}`);
        }
    }
    // ---------------------------------------------------------------- calculation
    async compute() {
        if (this.computing) {
            return;
        }
        this.computing = true;
        try {
            await this.computeAll(Date.now());
        }
        catch (e) {
            this.log.error(`Calculation failed: ${e.stack || e.message}`);
        }
        finally {
            this.computing = false;
        }
    }
    async computeAll(now) {
        const sources = {};
        for (const q of QUANTITIES) {
            sources[q] = this.series(q, now)?.source || 'none';
        }
        await this.set('info.sources', JSON.stringify(sources));
        const T = this.current('temperature', now);
        const rh = this.current('humidity', now);
        const wind = this.current('wind', now);
        const gust = this.current('gust', now);
        const dir = this.current('direction', now);
        const td = T !== undefined && rh !== undefined ? (0, physics_1.dewPoint)(T, rh) : undefined;
        // --- pressure
        const ps = this.series('pressure', now);
        const p = ps?.buffer.valueAt(now);
        const changes = {};
        for (const h of [1, 3, 6, 12, 24]) {
            changes[h] = ps?.buffer.change(h * series_1.HOUR, now);
            await this.set(`pressure.change${h}h`, changes[h]);
        }
        await this.set('pressure.seaLevel', p);
        const c3 = changes[3];
        if (c3 !== undefined) {
            const level = (0, pressure_1.tendencyLevel)(c3);
            await this.set('pressure.tendency', level, 0);
            await this.set('pressure.tendencyText', (0, texts_1.t)(`tendency.${level}`, this.lang));
            const p3 = ps?.buffer.valueAt(now - 3 * series_1.HOUR);
            const p15 = ps?.buffer.valueAt(now - 1.5 * series_1.HOUR);
            if (p3 !== undefined && p15 !== undefined && p !== undefined) {
                const code = (0, pressure_1.wmoCharacteristic)(p3, p15, p);
                await this.set('pressure.wmoCode', code, 0);
                await this.set('pressure.wmoText', (0, texts_1.t)(`wmo.${code}`, this.lang));
            }
        }
        else {
            for (const id of ['pressure.tendency', 'pressure.tendencyText', 'pressure.wmoCode', 'pressure.wmoText']) {
                await this.set(id, null);
            }
        }
        if (p !== undefined && c3 !== undefined) {
            const z = (0, zambretti_1.zambretti)(p, c3, new Date(now).getMonth() + 1, dir, (this.locLat ?? 50) < 0);
            await this.set('pressure.zambrettiCode', z.letter);
            await this.set('pressure.zambrettiText', (z.exceptional ? (this.lang === 'de' ? 'Außergewöhnlich: ' : 'Exceptional: ') : '') +
                (0, texts_1.zambrettiText)(z.index, this.lang));
        }
        else {
            await this.set('pressure.zambrettiCode', null);
            await this.set('pressure.zambrettiText', null);
        }
        // --- storm
        const storm = (0, pressure_1.stormRisk)({ change3h: c3, change24h: changes[24], latitude: this.locLat, gustMs: gust });
        let stormText = (0, texts_1.t)(`storm.${storm.level}`, this.lang);
        if (storm.reason) {
            const v = storm.reason === 'gust'
                ? (0, physics_1.beaufort)(gust ?? 0)
                : (0, physics_1.round)(Math.abs((storm.reason === 'bomb' ? changes[24] : c3) ?? 0), 1);
            stormText += ` (${(0, texts_1.t)(`storm.reason.${storm.reason}`, this.lang, { v })})`;
        }
        await this.set('storm.level', storm.level, 0);
        await this.set('storm.text', stormText);
        // --- humidity
        await this.set('humidity.dewPoint', td);
        await this.set('humidity.frostPoint', T !== undefined && rh !== undefined ? (0, physics_1.frostPoint)(T, rh) : undefined);
        await this.set('humidity.absolute', T !== undefined && rh !== undefined ? (0, physics_1.absoluteHumidity)(T, rh) : undefined);
        await this.set('humidity.spread', T !== undefined && td !== undefined ? T - td : undefined);
        await this.set('humidity.cloudBase', T !== undefined && td !== undefined ? (0, physics_1.cloudBase)(T, td) : undefined, 0);
        if (td !== undefined) {
            const m = (0, conditions_1.muggyLevel)(td);
            await this.set('humidity.muggy', m, 0);
            await this.set('humidity.muggyText', (0, texts_1.t)(`muggy.${m}`, this.lang));
        }
        // --- indoor
        const Ti = this.current('indoorTemperature', now);
        const rhi = this.current('indoorHumidity', now);
        if (Ti !== undefined && rhi !== undefined) {
            await this.set('indoor.dewPoint', (0, physics_1.dewPoint)(Ti, rhi));
            await this.set('indoor.absolute', (0, physics_1.absoluteHumidity)(Ti, rhi));
            const mold = (0, conditions_1.moldRisk)(rhi);
            await this.set('indoor.moldRisk', mold, 0);
            await this.set('indoor.moldText', (0, texts_1.t)(`mold.${mold}`, this.lang));
            if (T !== undefined && rh !== undefined) {
                const v = (0, conditions_1.ventilation)(Ti, rhi, T, rh);
                await this.set('indoor.ventilation', v.advice);
                await this.set('indoor.ventilate', v.advice === 'ventilate');
                await this.set('indoor.ventilationText', (0, texts_1.t)(`ventilation.${v.reason}`, this.lang));
                await this.set('indoor.humidityDifference', v.difference);
            }
        }
        // --- wind
        await this.set('wind.speed', wind);
        await this.set('wind.beaufort', wind !== undefined ? (0, physics_1.beaufort)(wind) : undefined, 0);
        await this.set('wind.gustBeaufort', gust !== undefined ? (0, physics_1.beaufort)(gust) : undefined, 0);
        await this.set('wind.gustFactor', wind !== undefined && gust !== undefined && wind >= 2 ? gust / wind : undefined, 2);
        const ds = this.series('direction', now);
        let shift;
        if (ds?.buffer.covers(3 * series_1.HOUR, now)) {
            const before = ds.buffer.valueAt(now - 3 * series_1.HOUR, 30 * series_1.MINUTE);
            const after = ds.buffer.valueAt(now, 30 * series_1.MINUTE);
            shift = before !== undefined && after !== undefined ? (0, physics_1.angleDiff)(before, after) : undefined;
        }
        await this.set('wind.shift3h', shift, 0);
        // --- temperature
        if (T !== undefined) {
            await this.set('temperature.feelsLike', (0, physics_1.feelsLike)(T, rh, wind));
            await this.set('temperature.windChill', wind !== undefined ? (0, physics_1.windChill)(T, wind) : undefined);
            await this.set('temperature.heatIndex', rh !== undefined ? (0, physics_1.heatIndex)(T, rh) : undefined);
            await this.set('temperature.humidex', td !== undefined ? (0, physics_1.humidex)(T, td) : undefined);
        }
        await this.set('temperature.change3h', this.series('temperature', now)?.buffer.change(3 * series_1.HOUR, now));
        // --- frost and fog
        const fc = this.forecast;
        const next18 = fc ? (0, forecast_1.forecastExtremes)(fc, 'temperature', now, now + 18 * series_1.HOUR) : undefined;
        await this.set('frost.nextMin', next18?.min);
        let frostLevel = 0;
        let fogLevel = 0;
        if (T !== undefined) {
            const frost = (0, conditions_1.frostRisk)(T, td, next18?.min);
            frostLevel = frost.level;
            await this.set('frost.level', frost.level, 0);
            await this.set('frost.iceRisk', frost.iceRisk);
            await this.set('frost.text', (0, texts_1.t)(`frost.${frost.level}`, this.lang) + (frost.iceRisk ? `, ${(0, texts_1.t)('frost.ice', this.lang)}` : ''));
            if (td !== undefined) {
                fogLevel = (0, conditions_1.fogRisk)(T, td, wind);
                await this.set('fog.level', fogLevel, 0);
                await this.set('fog.text', (0, texts_1.t)(`fog.${fogLevel}`, this.lang));
            }
        }
        // --- thunderstorms
        const off = this.utcOffset();
        const today = (0, health_1.dayKey)(now, off);
        const tomorrow = (0, health_1.dayKey)(now + 24 * series_1.HOUR, off);
        const dayAfter = (0, health_1.dayKey)(now + 48 * series_1.HOUR, off);
        const cape12 = fc ? (0, forecast_1.forecastExtremes)(fc, 'cape', now, now + 12 * series_1.HOUR)?.max : undefined;
        const thunderLevel = Math.max(T !== undefined && td !== undefined ? (0, conditions_1.thunderLocal)(T, td, c3) : 0, cape12 !== undefined ? (0, conditions_1.capeLevel)(cape12) : 0);
        await this.set('thunderstorm.capeMax12h', cape12, 0);
        await this.set('thunderstorm.level', thunderLevel, 0);
        await this.set('thunderstorm.text', (0, texts_1.t)(`thunder.${thunderLevel}`, this.lang));
        if (fc) {
            const dayMax = (key, date) => {
                const values = (0, forecast_1.forecastPoints)(fc, key)
                    .filter(pt => (0, health_1.dayKey)(pt.ts, off) === date)
                    .map(pt => pt.v);
                return values.length ? Math.max(...values) : undefined;
            };
            const capeToday = dayMax('cape', today);
            const capeTomorrow = dayMax('cape', tomorrow);
            await this.set('thunderstorm.today', capeToday !== undefined ? (0, conditions_1.capeLevel)(capeToday) : undefined, 0);
            await this.set('thunderstorm.tomorrow', capeTomorrow !== undefined ? (0, conditions_1.capeLevel)(capeTomorrow) : undefined, 0);
            const gustToday = dayMax('gust', today);
            const gustTomorrow = dayMax('gust', tomorrow);
            await this.set('storm.today', gustToday !== undefined ? (0, pressure_1.stormRisk)({ gustMs: gustToday }).level : undefined, 0);
            await this.set('storm.tomorrow', gustTomorrow !== undefined ? (0, pressure_1.stormRisk)({ gustMs: gustTomorrow }).level : undefined, 0);
        }
        // --- fronts
        if (ps) {
            const front = (0, conditions_1.detectFront)(ps.buffer, this.series('temperature', now)?.buffer, this.series('humidity', now)?.buffer, ds?.buffer, now);
            await this.set('front.type', front.type);
            await this.set('front.text', (0, texts_1.t)(`front.${front.type}`, this.lang));
            if (front.type === 'cold' && front.at && front.at - this.lastColdFront > series_1.HOUR) {
                this.lastColdFront = front.at;
                await this.set('front.lastColdFront', front.at, 0);
                this.log.info(`Cold front detected at ${new Date(front.at).toISOString()}`);
            }
        }
        // --- forecast comparison
        if (fc && ps?.source === 'sensor' && p !== undefined) {
            const fp = (0, forecast_1.forecastValueAt)(fc, 'pressure', now);
            const bias = fp !== undefined ? p - fp : undefined;
            await this.set('forecast.pressureBias', bias);
            if (bias !== undefined && Math.abs(bias) > 5 && !this.biasWarned && ps.buffer.covers(6 * series_1.HOUR, now)) {
                this.biasWarned = true;
                this.log.warn(`The measured sea-level pressure differs by ${(0, physics_1.round)(bias, 1)} hPa from the forecast. Check the altitude (${this.altitude} m) and the pressure type in the settings.`);
            }
        }
        if (fc && this.series('temperature', now)?.source === 'sensor' && T !== undefined) {
            const ft = (0, forecast_1.forecastValueAt)(fc, 'temperature', now);
            await this.set('forecast.temperatureBias', ft !== undefined ? T - ft : undefined);
        }
        // --- weather sensitivity
        if (this.config.healthEnabled) {
            await this.computeHealth(now, [today, tomorrow, dayAfter]);
        }
        // --- summary
        const active = [];
        if (storm.level) {
            active.push(stormText);
        }
        if (thunderLevel) {
            active.push((0, texts_1.t)(`thunder.${thunderLevel}`, this.lang));
        }
        if (frostLevel) {
            active.push((0, texts_1.t)(`frost.${frostLevel}`, this.lang));
        }
        if (fogLevel >= 2) {
            active.push((0, texts_1.t)(`fog.${fogLevel}`, this.lang));
        }
        await this.set('summary.level', Math.max(storm.level, thunderLevel, frostLevel, fogLevel >= 2 ? fogLevel - 1 : 0), 0);
        await this.set('summary.text', active.length ? active.join('; ') : (0, texts_1.t)('summary.none', this.lang));
        await this.setStateAsync('info.lastUpdate', now, true);
    }
    async computeHealth(now, days) {
        const off = this.utcOffset();
        let points = [];
        if (this.forecast) {
            points = (0, forecast_1.forecastPoints)(this.forecast, 'pressure');
        }
        else {
            const ps = this.series('pressure', now);
            if (ps) {
                const startHour = Math.floor((now - 26 * series_1.HOUR) / series_1.HOUR) * series_1.HOUR;
                for (let ts = startHour; ts <= now; ts += series_1.HOUR) {
                    const v = ps.buffer.valueAt(ts);
                    if (v !== undefined) {
                        points.push({ ts, v });
                    }
                }
            }
        }
        const factor = health_1.SENSITIVITY_FACTOR[this.config.sensitivity] ?? 1;
        const direction = this.config.healthDirection || 'both';
        const prefixes = ['health.today', 'health.tomorrow', 'health.dayAfter'];
        let todayResult = null;
        for (let i = 0; i < days.length; i++) {
            const res = (0, health_1.analyzeDay)(points, days[i], off, factor, direction);
            if (i === 0) {
                todayResult = (0, health_1.analyzeDay)(points, days[i], off, 1, 'both');
            }
            await this.writeHealthDay(prefixes[i], res);
        }
        // diary: keep the largest 6 h change of today
        if (todayResult?.windows[6]) {
            const entry = this.diaryEntry(days[0]);
            const value = (0, physics_1.round)(Math.abs(todayResult.windows[6].change), 1);
            if (entry.max6h !== value) {
                entry.max6h = value;
                await this.setStateChangedAsync('health.diary', JSON.stringify(this.diary), true);
                await this.updateDiaryAnalysis();
            }
        }
    }
    async writeHealthDay(prefix, res) {
        if (!res) {
            for (const s of ['level', 'text', 'change3h', 'change6h', 'change12h', 'change24h', 'peakFrom', 'peakTo']) {
                await this.set(`${prefix}.${s}`, null);
            }
            return;
        }
        const w6 = res.windows[6];
        await this.set(`${prefix}.level`, res.level, 0);
        for (const h of [3, 6, 12, 24]) {
            await this.set(`${prefix}.change${h}h`, res.windows[h]?.change);
        }
        await this.set(`${prefix}.peakFrom`, w6.from, 0);
        await this.set(`${prefix}.peakTo`, w6.to, 0);
        const dirText = (0, texts_1.t)(w6.change < 0 ? 'health.falling' : 'health.rising', this.lang, {
            v: (0, physics_1.round)(Math.abs(w6.change), 1),
        });
        const window = (0, texts_1.t)('health.window', this.lang, { from: this.formatTime(w6.from), to: this.formatTime(w6.to) });
        await this.set(`${prefix}.text`, `${(0, texts_1.t)(`health.${res.level}`, this.lang)}: ${dirText}, ${window}`);
    }
}
exports.WeatherInsightsAdapter = WeatherInsightsAdapter;
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new WeatherInsightsAdapter(options);
}
else {
    // otherwise start the instance directly
    (() => new WeatherInsightsAdapter())();
}
//# sourceMappingURL=main.js.map