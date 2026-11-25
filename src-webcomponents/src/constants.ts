/** Tag of `<iob-weather-insights>`: pressure course, warnings and weather sensitivity of one instance */
export const TAG = 'iob-weather-insights';

/** The built module and its manifest, in `admin/webcomponents/` - `common.webComponents` names the manifest */
export const MODULE_FILE = 'weather-insights.js';
export const MANIFEST_FILE = 'weather-insights.json';
export const ICON_FILE = 'weather-insights.svg';

/** The values of the settings; a setting without a value is missing */
export type InsightsSettings = {
    /** e.g. `weather-insights.0` */
    instance?: string;
    showPressure?: boolean;
    showChart?: boolean;
    showWarnings?: boolean;
    showHealth?: boolean;
};

/** The states of the instance the element shows (see `src/lib/objects.ts` of the adapter) */
export const STATES = [
    'pressure.seaLevel',
    'pressure.change3h',
    'pressure.tendency',
    'pressure.tendencyText',
    'pressure.zambrettiCode',
    'pressure.zambrettiText',
    'pressure.course',
    'storm.level',
    'storm.text',
    'thunderstorm.level',
    'thunderstorm.text',
    'frost.level',
    'frost.text',
    'fog.level',
    'fog.text',
    'summary.level',
    'summary.text',
    'health.today.level',
    'health.today.text',
    'health.today.change6h',
    'health.today.peakFrom',
    'health.today.peakTo',
    'health.tomorrow.level',
    'health.tomorrow.text',
    'health.tomorrow.change6h',
    'health.tomorrow.peakFrom',
    'health.tomorrow.peakTo',
    'health.dayAfter.level',
    'health.dayAfter.text',
    'health.dayAfter.change6h',
    'health.dayAfter.peakFrom',
    'health.dayAfter.peakTo',
] as const;

export type InsightsState = (typeof STATES)[number];
