'use strict';
const { expect } = require('chai');
const physics = require('../build/lib/physics');
const { tendencyLevel, wmoCharacteristic, stormRisk } = require('../build/lib/pressure');
const { zambretti } = require('../build/lib/zambretti');
const { SeriesBuffer, HOUR, MINUTE } = require('../build/lib/series');
const { analyzeDay, analyzeDiary, healthLevel, dayKey } = require('../build/lib/health');
const { ventilation, fogRisk, frostRisk, detectFront, capeLevel } = require('../build/lib/conditions');
const { parseForecast, forecastValueAt } = require('../build/lib/forecast');

describe('physics', () => {
    it('dew point and absolute humidity', () => {
        expect(physics.dewPoint(20, 50)).to.be.closeTo(9.3, 0.1);
        expect(physics.absoluteHumidity(20, 50)).to.be.closeTo(8.6, 0.1);
        expect(physics.dewPoint(10, 100)).to.be.closeTo(10, 0.01);
    });
    it('frost point is below the dew point under 0 °C', () => {
        expect(physics.frostPoint(-5, 80)).to.be.greaterThan(physics.dewPoint(-5, 80));
    });
    it('reduces station pressure to sea level', () => {
        expect(physics.seaLevelPressure(950, 500, 15)).to.be.closeTo(1007.7, 0.5);
        expect(physics.seaLevelPressure(1013, 0, 15)).to.equal(1013);
        expect(physics.standardStationPressure(0)).to.be.closeTo(1013.25, 0.01);
    });
    it('Beaufort scale', () => {
        expect(physics.beaufort(0.2)).to.equal(0);
        expect(physics.beaufort(17.2)).to.equal(8);
        expect(physics.beaufort(40)).to.equal(12);
    });
    it('wind chill and heat index', () => {
        expect(physics.windChill(-10, 30 / 3.6)).to.be.closeTo(-19.5, 0.2);
        expect(physics.windChill(15, 10)).to.equal(15);
        expect(physics.heatIndex(32, 70)).to.be.closeTo(41, 1);
        expect(physics.heatIndex(20, 70)).to.equal(20);
    });
    it('signed angle difference', () => {
        expect(physics.angleDiff(350, 20)).to.equal(30);
        expect(physics.angleDiff(20, 350)).to.equal(-30);
    });
});

describe('pressure', () => {
    it('tendency levels', () => {
        expect(tendencyLevel(0.05)).to.equal(0);
        expect(tendencyLevel(-1)).to.equal(-1);
        expect(tendencyLevel(-4)).to.equal(-3);
        expect(tendencyLevel(7)).to.equal(4);
    });
    it('WMO characteristic', () => {
        expect(wmoCharacteristic(1010, 1011, 1012)).to.equal(2);
        expect(wmoCharacteristic(1012, 1011, 1010)).to.equal(7);
        expect(wmoCharacteristic(1010, 1012, 1010.5)).to.equal(0);
        expect(wmoCharacteristic(1012, 1010, 1011)).to.equal(5);
        expect(wmoCharacteristic(1010, 1010, 1010)).to.equal(4);
        expect(wmoCharacteristic(1010, 1010.02, 1011.5)).to.equal(3);
        expect(wmoCharacteristic(1012, 1010, 1010)).to.equal(6);
    });
    it('storm risk', () => {
        expect(stormRisk({ change3h: -1 })).to.deep.equal({ level: 0, reason: '' });
        expect(stormRisk({ change3h: -6.5 })).to.deep.equal({ level: 2, reason: 'fall3h' });
        expect(stormRisk({ change3h: 4 })).to.deep.equal({ level: 1, reason: 'rise3h' });
        expect(stormRisk({ gustMs: 22 })).to.deep.equal({ level: 2, reason: 'gust' });
        expect(stormRisk({ change24h: -25, latitude: 60 })).to.deep.equal({ level: 3, reason: 'bomb' });
    });
});

describe('zambretti', () => {
    it('steady average pressure in winter', () => {
        const z = zambretti(1013, 0, 1);
        expect(z.letter).to.equal('E');
        expect(z.text).to.equal('Fine, possible showers');
    });
    it('rising high pressure', () => {
        expect(zambretti(1030, 2, 1).letter).to.equal('A');
    });
    it('falling low pressure', () => {
        expect(zambretti(990, -2, 1).letter).to.equal('X');
    });
    it('southerly wind lowers the forecast on the northern hemisphere', () => {
        expect(zambretti(1013, 0, 1, 180).index).to.be.greaterThan(zambretti(1013, 0, 1, 0).index);
    });
});

describe('SeriesBuffer', () => {
    it('computes changes and holds the last value', () => {
        const now = Date.UTC(2026, 0, 10, 12);
        const buf = new SeriesBuffer(26 * HOUR, 5 * MINUTE);
        for (let h = 6; h >= 0; h--) {
            buf.add(now - h * HOUR, 1010 - h); // rising 1 hPa per hour
        }
        expect(buf.change(3 * HOUR, now)).to.be.closeTo(3, 0.001);
        expect(buf.change(12 * HOUR, now)).to.equal(undefined);
        expect(buf.valueAt(now + 30 * MINUTE)).to.equal(1010);
    });
    it('averages directions as vectors', () => {
        const now = Date.UTC(2026, 0, 10, 12);
        const buf = new SeriesBuffer(26 * HOUR, MINUTE, true);
        buf.add(now - 4 * MINUTE, 350);
        buf.add(now - 2 * MINUTE, 10);
        const v = buf.valueAt(now);
        expect(v < 1 || v > 359).to.equal(true);
    });
});

describe('health', () => {
    it('levels from the 6 h change', () => {
        expect(healthLevel(1.9)).to.equal(0);
        expect(healthLevel(4.2)).to.equal(2);
        expect(healthLevel(9.1)).to.equal(4);
        expect(healthLevel(1.5, 0.7)).to.equal(1);
    });
    it('finds the strongest window of a day', () => {
        const day1 = Date.UTC(2026, 0, 10);
        const points = [];
        for (let h = 0; h < 48; h++) {
            const ts = day1 + h * HOUR;
            // day 2: falls 1 hPa per hour from 06:00 to 12:00
            let v = 1015;
            if (h >= 30) {
                v = 1015 - Math.min(h - 30, 6);
            }
            points.push({ ts, v });
        }
        const res = analyzeDay(points, '2026-01-11', 0);
        expect(res.level).to.equal(3);
        expect(res.windows[6].change).to.equal(-6);
        expect(new Date(res.windows[6].from).toISOString()).to.equal('2026-01-11T06:00:00.000Z');
        expect(analyzeDay(points, '2026-01-11', 0, 1, 'rising').level).to.equal(0);
        expect(dayKey(day1 + 23 * HOUR, 3600)).to.equal('2026-01-11');
        // a fall from 18:00 to 00:00 belongs to the day it happened on, not to the next one
        const late = points.map(p => ({
            ts: p.ts,
            v:
                p.ts >= day1 + 18 * HOUR && p.ts <= day1 + 24 * HOUR
                    ? 1015 - (p.ts - day1 - 18 * HOUR) / HOUR
                    : p.ts > day1 + 24 * HOUR
                      ? 1009
                      : 1015,
        }));
        expect(analyzeDay(late, '2026-01-10', 0).windows[6].change).to.equal(-6);
        expect(analyzeDay(late, '2026-01-11', 0).windows[6].change).to.equal(-3); // only the window around midnight
    });
    it('suggests a sensitivity from the diary', () => {
        const entries = [];
        for (let d = 1; d <= 14; d++) {
            entries.push({ date: `2026-01-${String(d).padStart(2, '0')}`, max6h: d <= 3 ? 5 : 1, migraine: d <= 3 });
        }
        const a = analyzeDiary(entries);
        expect(a.migraineDays).to.equal(3);
        expect(a.avgMigraine).to.equal(5);
        expect(a.suggestedSensitivity).to.equal('normal');
        expect(analyzeDiary(entries.slice(0, 5)).suggestedSensitivity).to.equal(null);
    });
});

describe('conditions', () => {
    it('ventilation advice', () => {
        expect(ventilation(22, 60, 5, 80).advice).to.equal('ventilate');
        expect(ventilation(20, 40, 25, 80).advice).to.equal('keep-closed');
        expect(ventilation(24, 50, 30, 30).reason).to.equal('heat');
    });
    it('fog and frost', () => {
        expect(fogRisk(5, 4.5, 1)).to.equal(3);
        expect(fogRisk(15, 5, 1)).to.equal(0);
        expect(frostRisk(-1).level).to.equal(3);
        expect(frostRisk(6, 2, -1).level).to.equal(2);
        expect(frostRisk(0.5, -0.5).iceRisk).to.equal(true);
        expect(capeLevel(1200)).to.equal(2);
    });
    it('detects a cold front passage', () => {
        const now = Date.UTC(2026, 6, 10, 18);
        const p = new SeriesBuffer(26 * HOUR, MINUTE);
        const t = new SeriesBuffer(26 * HOUR, MINUTE);
        for (let m = 240; m >= 0; m -= 10) {
            const ts = now - m * MINUTE;
            // minimum 90 min ago: falls 2 hPa before, rises 2 hPa after
            p.add(ts, m >= 90 ? 1008 - ((240 - m) / 150) * 2 : 1006 + ((90 - m) / 90) * 2);
            t.add(ts, m >= 90 ? 26 : 26 - ((90 - m) / 90) * 5);
        }
        const res = detectFront(p, t, undefined, undefined, now);
        expect(res.type).to.equal('cold');
    });
});

describe('forecast', () => {
    it('parses an Open-Meteo answer', () => {
        const base = Date.UTC(2026, 0, 10) / 1000;
        const fc = parseForecast({
            utc_offset_seconds: 3600,
            elevation: 120,
            hourly: {
                time: [base, base + 3600],
                pressure_msl: [1010, 1012],
                temperature_2m: [5, 6],
            },
        });
        expect(fc.offsetSec).to.equal(3600);
        expect(fc.elevation).to.equal(120);
        expect(forecastValueAt(fc, 'pressure', (base + 1800) * 1000)).to.be.closeTo(1011, 0.001);
        expect(() => parseForecast({ error: true, reason: 'bad' })).to.throw('bad');
    });
});
