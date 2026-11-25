/**
 * `<iob-weather-insights>`: the conclusions of one weather-insights instance - sea-level pressure with tendency and
 * Zambretti forecast, the pressure course of the last 24 h and the next 48 h, active weather warnings and the
 * weather sensitivity (migraine) for today, tomorrow and the day after. Shown alike by vis-2, devices, Aura and
 * admin (the tab "Overview" of the instance configuration).
 *
 * Plain DOM, no framework: the module brings the base class and nothing else, so it needs no React of the host.
 */
import { defineWebComponent, IobWebComponent } from '@iobroker/web-components/element';

import { STATES, TAG, type InsightsSettings, type InsightsState } from './constants.ts';
import { word, type WordKey } from './i18n.ts';
import { STYLES } from './styles.ts';

const INSTANCE_PREFIX = 'system.adapter.';
const HOUR = 3_600_000;

type Values = Partial<Record<InsightsState, ioBroker.StateValue>>;
type CoursePoint = [number, number, number];

/** `weather-insights.0` from `weather-insights.0` or `system.adapter.weather-insights.0` */
function getInstance(value: string | undefined): string {
    const instance = (value || '').trim();
    return instance.startsWith(INSTANCE_PREFIX) ? instance.slice(INSTANCE_PREFIX.length) : instance;
}

function escapeXml(text: string): string {
    return text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}

function toNumber(val: ioBroker.StateValue | undefined): number | null {
    if (val === null || val === undefined || val === '') {
        return null;
    }
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return Number.isFinite(n) ? n : null;
}

function parseCourse(val: ioBroker.StateValue | undefined): CoursePoint[] {
    try {
        const arr = JSON.parse(String(val || '[]'));
        return Array.isArray(arr)
            ? arr.filter(p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
            : [];
    } catch {
        return [];
    }
}

/** Shown in edit mode while no instance is chosen */
function sampleValues(): Values {
    const now = Math.floor(Date.now() / HOUR) * HOUR;
    const course: CoursePoint[] = [];
    for (let h = -24; h <= 48; h++) {
        const v = 1016 - 6 * Math.sin((h + 10) / 12) + (h > 20 ? (h - 20) * 0.35 : 0);
        course.push([now + h * HOUR, Math.round(v * 10) / 10, h > 0 ? 1 : 0]);
    }
    return {
        'pressure.seaLevel': course[24][1],
        'pressure.change3h': -1.8,
        'pressure.tendency': -2,
        'pressure.tendencyText': 'falling',
        'pressure.zambrettiCode': 'P',
        'pressure.zambrettiText': 'Changeable, some rain',
        'pressure.course': JSON.stringify(course),
        'storm.level': 1,
        'storm.text': 'Gale possible',
        'health.today.level': 1,
        'health.today.text': 'Moderate: pressure falling 3.2 hPa, 14:00-20:00',
        'health.today.peakFrom': now + 2 * HOUR,
        'health.today.peakTo': now + 8 * HOUR,
        'health.tomorrow.level': 3,
        'health.tomorrow.text': 'Strong: pressure rising 6.4 hPa, 06:00-12:00',
        'health.tomorrow.peakFrom': now + 26 * HOUR,
        'health.tomorrow.peakTo': now + 32 * HOUR,
        'health.dayAfter.level': 0,
        'health.dayAfter.text': 'Low: pressure rising 1.1 hPa, 03:00-09:00',
    };
}

const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

class WeatherInsightsElement extends IobWebComponent<InsightsSettings> {
    readonly #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
    }

    protected override getStateIds(settings: InsightsSettings): string[] {
        const instance = getInstance(settings.instance);
        return instance ? STATES.map(state => `${instance}.${state}`) : [];
    }

    #format(value: number, digits: number, sign = false): string {
        const lang = this.systemLang === 'zh-cn' ? 'zh-CN' : this.systemLang;
        try {
            return value.toLocaleString(lang, {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
                signDisplay: sign ? 'exceptZero' : 'auto',
                useGrouping: false,
            });
        } catch {
            return (sign && value > 0 ? '+' : '') + value.toFixed(digits);
        }
    }

    #renderHead(v: Values): string {
        const lang = this.systemLang;
        const p = toNumber(v['pressure.seaLevel']);
        if (p === null) {
            return `<div class="head"><span class="none">${escapeXml(word('noData', lang))}</span></div>`;
        }
        let html = `<div class="head"><div class="value"><span class="big">${this.#format(p, 1)}</span><span class="unit">hPa</span></div>`;
        const tendency = toNumber(v['pressure.tendency']);
        const change = toNumber(v['pressure.change3h']);
        if (tendency !== null) {
            const cls = tendency <= -2 ? 'falling' : tendency >= 2 ? 'rising' : 'steady';
            const text = String(v['pressure.tendencyText'] ?? '');
            const delta = change !== null ? ` · ${this.#format(change, 1, true)} hPa ${word('in3h', lang)}` : '';
            html += `<div class="trend ${cls}"><span style="display:inline-flex;transform:rotate(${-tendency * 20}deg)">${ARROW}</span><span>${escapeXml(text + delta)}</span></div>`;
        }
        const zText = v['pressure.zambrettiText'];
        if (zText) {
            const code = v['pressure.zambrettiCode'] ? `${String(v['pressure.zambrettiCode'])} · ` : '';
            html += `<div class="zambretti">Zambretti: <b>${escapeXml(code + String(zText))}</b></div>`;
        }
        return `${html}</div>`;
    }

    #renderChart(v: Values): string {
        const course = parseCourse(v['pressure.course']);
        if (course.length < 2) {
            return '';
        }
        const W = 560;
        const H = 150;
        const left = 34;
        const right = 6;
        const top = 8;
        const bottom = 18;
        const t0 = course[0][0];
        const t1 = course[course.length - 1][0];
        let min = Math.min(...course.map(c => c[1]));
        let max = Math.max(...course.map(c => c[1]));
        if (max - min < 8) {
            const mid = (max + min) / 2;
            min = mid - 4;
            max = mid + 4;
        }
        min = Math.floor(min - 1);
        max = Math.ceil(max + 1);
        const x = (ts: number): number => left + ((ts - t0) / Math.max(1, t1 - t0)) * (W - left - right);
        const y = (p: number): number => top + ((max - p) / (max - min)) * (H - top - bottom);

        let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">`;
        // health bands
        for (const day of ['today', 'tomorrow', 'dayAfter'] as const) {
            const level = toNumber(v[`health.${day}.level`]);
            const from = toNumber(v[`health.${day}.peakFrom`]);
            const to = toNumber(v[`health.${day}.peakTo`]);
            if (level && from !== null && to !== null && to > t0 && from < t1) {
                const a = x(Math.max(from, t0));
                const b = x(Math.min(to, t1));
                svg += `<rect class="band l${level}" x="${a.toFixed(1)}" y="${top}" width="${Math.max(1, b - a).toFixed(1)}" height="${H - top - bottom}"/>`;
            }
        }
        // grid
        const step = max - min > 24 ? 10 : 5;
        for (let g = Math.ceil(min / step) * step; g <= max; g += step) {
            const gy = y(g).toFixed(1);
            svg += `<line class="grid" x1="${left}" x2="${W - right}" y1="${gy}" y2="${gy}"/>`;
            svg += `<text class="axis" x="${left - 4}" y="${gy}" text-anchor="end" dominant-baseline="middle">${g}</text>`;
        }
        // midnights with the name of the next day, hours 00 and 12 in local time
        const first = new Date(t0);
        first.setHours(24, 0, 0, 0);
        const dayWords: WordKey[] = ['tomorrow', 'dayAfter'];
        let dayIndex = first.getTime() - Date.now() > 0 ? 0 : -1;
        for (const d = new Date(first); d.getTime() < t1; d.setDate(d.getDate() + 1)) {
            const ts = d.getTime();
            const mx = x(ts).toFixed(1);
            svg += `<line class="midnight" x1="${mx}" x2="${mx}" y1="${top}" y2="${H - bottom}"/>`;
            const name =
                dayIndex < 0
                    ? word('today', this.systemLang)
                    : dayWords[dayIndex]
                      ? word(dayWords[dayIndex], this.systemLang)
                      : '';
            if (name && x(ts) < W - right - 40) {
                svg += `<text class="axis" x="${(x(ts) + 4).toFixed(1)}" y="${top + 10}">${escapeXml(name)}</text>`;
            }
            dayIndex++;
        }
        const hourStart = new Date(t0);
        hourStart.setMinutes(0, 0, 0);
        hourStart.setHours(Math.ceil(hourStart.getHours() / 12) * 12);
        for (const d = hourStart; d.getTime() <= t1; d.setHours(d.getHours() + 12)) {
            const ts = d.getTime();
            if (ts >= t0) {
                svg += `<text class="axis" x="${x(ts).toFixed(1)}" y="${H - 4}" text-anchor="middle">${String(d.getHours()).padStart(2, '0')}</text>`;
            }
        }
        // course: measured part solid, forecast dashed
        const lastMeasured = course.reduce((acc, c, i) => (c[2] === 0 ? i : acc), -1);
        const now = Date.now();
        let split = lastMeasured >= 0 ? lastMeasured : course.findIndex(c => c[0] > now) - 1;
        if (split < 0) {
            split = course.length - 1;
        }
        const path = (points: CoursePoint[]): string =>
            points.map((c, i) => `${i ? 'L' : 'M'}${x(c[0]).toFixed(1)} ${y(c[1]).toFixed(1)}`).join('');
        svg += `<path class="past" d="${path(course.slice(0, split + 1))}"/>`;
        if (split < course.length - 1) {
            svg += `<path class="future" d="${path(course.slice(split))}"/>`;
        }
        if (now > t0 && now < t1) {
            const nx = x(now).toFixed(1);
            svg += `<line class="now" x1="${nx}" x2="${nx}" y1="${top}" y2="${H - bottom}"/>`;
        }
        return `<div class="chart">${svg}</svg></div>`;
    }

    #renderWarnings(v: Values): string {
        const lang = this.systemLang;
        const chips: string[] = [];
        const items: [InsightsState, InsightsState, WordKey][] = [
            ['storm.level', 'storm.text', 'storm'],
            ['thunderstorm.level', 'thunderstorm.text', 'thunderstorm'],
            ['frost.level', 'frost.text', 'frost'],
            ['fog.level', 'fog.text', 'fog'],
        ];
        for (const [levelId, textId, name] of items) {
            const level = toNumber(v[levelId]);
            // fog level 1 (mist) is no warning
            if (level && (name !== 'fog' || level >= 2)) {
                const text = String(v[textId] || word(name, lang));
                chips.push(
                    `<span class="chip l${Math.min(4, level + 1)}"><span class="dot"></span>${escapeXml(text)}</span>`,
                );
            }
        }
        if (!chips.length) {
            chips.push(`<span class="none">${escapeXml(word('noWarnings', lang))}</span>`);
        }
        return `<div class="warnings">${chips.join('')}</div>`;
    }

    #renderHealth(v: Values): string {
        const lang = this.systemLang;
        const days: [string, WordKey][] = [
            ['today', 'today'],
            ['tomorrow', 'tomorrow'],
            ['dayAfter', 'dayAfter'],
        ];
        const cards = days
            .map(([day, label]) => {
                const level = toNumber(v[`health.${day}.level` as InsightsState]);
                if (level === null) {
                    return '';
                }
                const text = String(v[`health.${day}.text` as InsightsState] || '');
                const sep = text.indexOf(': ');
                const levelName = sep > 0 ? text.slice(0, sep) : String(level);
                const detail = sep > 0 ? text.slice(sep + 2) : text;
                return (
                    `<div class="day"><div class="day-name">${escapeXml(word(label, lang))}</div>` +
                    `<div class="level l${level}"><span class="dot"></span>${escapeXml(levelName)}</div>` +
                    `<div class="detail" title="${escapeXml(detail)}">${escapeXml(detail)}</div></div>`
                );
            })
            .join('');
        if (!cards) {
            return '';
        }
        return `<div class="health-title">${escapeXml(word('sensitivity', lang))}</div><div class="health">${cards}</div>`;
    }

    #renderBody(): string {
        const settings = this.settings;
        const instance = getInstance(settings.instance);
        let values: Values;
        if (!instance) {
            if (!this.editMode) {
                return `<div class="message">${escapeXml(word('chooseInstance', this.systemLang))}</div>`;
            }
            values = sampleValues();
        } else {
            values = {};
            for (const state of STATES) {
                values[state] = this.states[`${instance}.${state}`]?.val;
            }
        }
        let html = '';
        if (settings.showPressure !== false) {
            html += this.#renderHead(values);
        }
        if (settings.showChart !== false) {
            html += this.#renderChart(values);
        }
        if (settings.showWarnings !== false) {
            html += this.#renderWarnings(values);
        }
        if (settings.showHealth !== false) {
            html += this.#renderHealth(values);
        }
        return html;
    }

    protected override render(): void {
        this.#shadow.innerHTML = `<style>${STYLES}</style><div class="root">${this.#renderBody()}</div>`;
    }
}

defineWebComponent(TAG, WeatherInsightsElement);
