/**
 * Texts written into the text states. The system language picks German or English.
 */
import { ZAMBRETTI_FORECASTS } from './zambretti';

export type Lang = 'en' | 'de';

type Entry = { en: string; de: string };

const TEXTS: Record<string, Entry> = {
    'tendency.-4': { en: 'falling very rapidly', de: 'sehr stark fallend' },
    'tendency.-3': { en: 'falling quickly', de: 'stark fallend' },
    'tendency.-2': { en: 'falling', de: 'fallend' },
    'tendency.-1': { en: 'falling slowly', de: 'leicht fallend' },
    'tendency.0': { en: 'steady', de: 'gleichbleibend' },
    'tendency.1': { en: 'rising slowly', de: 'leicht steigend' },
    'tendency.2': { en: 'rising', de: 'steigend' },
    'tendency.3': { en: 'rising quickly', de: 'stark steigend' },
    'tendency.4': { en: 'rising very rapidly', de: 'sehr stark steigend' },

    'wmo.0': { en: 'rising, then falling', de: 'erst steigend, dann fallend' },
    'wmo.1': {
        en: 'rising, then steady or rising more slowly',
        de: 'erst steigend, dann gleichbleibend oder langsamer steigend',
    },
    'wmo.2': { en: 'rising steadily', de: 'gleichmäßig steigend' },
    'wmo.3': {
        en: 'falling or steady, then rising; or rising more quickly',
        de: 'erst fallend oder gleichbleibend, dann steigend; oder schneller steigend',
    },
    'wmo.4': { en: 'steady', de: 'gleichbleibend' },
    'wmo.5': { en: 'falling, then rising', de: 'erst fallend, dann steigend' },
    'wmo.6': {
        en: 'falling, then steady or falling more slowly',
        de: 'erst fallend, dann gleichbleibend oder langsamer fallend',
    },
    'wmo.7': { en: 'falling steadily', de: 'gleichmäßig fallend' },
    'wmo.8': {
        en: 'steady or rising, then falling; or falling more quickly',
        de: 'erst gleichbleibend oder steigend, dann fallend; oder schneller fallend',
    },

    'storm.0': { en: 'No signs of a storm', de: 'Keine Sturmanzeichen' },
    'storm.1': { en: 'Gale possible', de: 'Sturmböen möglich' },
    'storm.2': { en: 'Storm likely', de: 'Sturm wahrscheinlich' },
    'storm.3': { en: 'Severe storm', de: 'Schwerer Sturm' },
    'storm.reason.fall3h': { en: 'pressure fell {v} hPa in 3 h', de: 'Luftdruck in 3 h um {v} hPa gefallen' },
    'storm.reason.rise3h': { en: 'pressure rose {v} hPa in 3 h', de: 'Luftdruck in 3 h um {v} hPa gestiegen' },
    'storm.reason.bomb': { en: 'pressure fell {v} hPa in 24 h', de: 'Luftdruck in 24 h um {v} hPa gefallen' },
    'storm.reason.gust': { en: 'gusts of Beaufort {v}', de: 'Böen mit Beaufort {v}' },

    'fog.0': { en: 'No fog', de: 'Kein Nebel' },
    'fog.1': { en: 'Mist possible', de: 'Dunst möglich' },
    'fog.2': { en: 'Fog possible', de: 'Nebel möglich' },
    'fog.3': { en: 'Fog likely', de: 'Nebel wahrscheinlich' },

    'muggy.0': { en: 'comfortable', de: 'angenehm' },
    'muggy.1': { en: 'muggy', de: 'schwül' },
    'muggy.2': { en: 'oppressive', de: 'drückend schwül' },
    'muggy.3': { en: 'very oppressive', de: 'sehr drückend schwül' },

    'mold.0': { en: 'No mould risk', de: 'Kein Schimmelrisiko' },
    'mold.1': { en: 'Slight mould risk', de: 'Leichtes Schimmelrisiko' },
    'mold.2': { en: 'Mould risk', de: 'Schimmelrisiko' },
    'mold.3': { en: 'High mould risk', de: 'Hohes Schimmelrisiko' },

    'ventilation.drier': { en: 'Ventilate: the outside air is drier', de: 'Lüften: die Außenluft ist trockener' },
    'ventilation.humid': {
        en: 'Keep closed: the outside air is more humid',
        de: 'Geschlossen lassen: die Außenluft ist feuchter',
    },
    'ventilation.heat': { en: 'Keep closed: it is warmer outside', de: 'Geschlossen lassen: draußen ist es wärmer' },
    'ventilation.similar': {
        en: 'Ventilating makes no difference to the humidity',
        de: 'Lüften ändert an der Feuchte nichts',
    },

    'frost.0': { en: 'No frost', de: 'Kein Frost' },
    'frost.1': { en: 'Ground frost possible', de: 'Bodenfrost möglich' },
    'frost.2': { en: 'Frost expected', de: 'Frost erwartet' },
    'frost.3': { en: 'Frost', de: 'Frost' },
    'frost.ice': { en: 'risk of hoar frost or black ice', de: 'Gefahr von Reif oder Glätte' },

    'thunder.0': { en: 'No signs of thunderstorms', de: 'Keine Gewitteranzeichen' },
    'thunder.1': { en: 'Thunderstorms possible', de: 'Gewitter möglich' },
    'thunder.2': { en: 'Thunderstorms likely', de: 'Gewitter wahrscheinlich' },
    'thunder.3': { en: 'Severe thunderstorms possible', de: 'Schwere Gewitter möglich' },

    'front.none': { en: 'No front', de: 'Keine Front' },
    'front.warm': { en: 'Warm front approaching', de: 'Warmfront zieht auf' },
    'front.cold': { en: 'Cold front passed', de: 'Kaltfront durchgezogen' },

    'health.0': { en: 'Low', de: 'Gering' },
    'health.1': { en: 'Moderate', de: 'Mäßig' },
    'health.2': { en: 'Elevated', de: 'Erhöht' },
    'health.3': { en: 'Strong', de: 'Stark' },
    'health.4': { en: 'Very strong', de: 'Sehr stark' },
    'health.falling': { en: 'pressure falling {v} hPa', de: 'Luftdruck fällt um {v} hPa' },
    'health.rising': { en: 'pressure rising {v} hPa', de: 'Luftdruck steigt um {v} hPa' },
    'health.window': { en: '{from}-{to}', de: '{from}-{to} Uhr' },
    'health.analysis.few': {
        en: 'Days recorded: {days}, with migraine: {mig}. At least 14 days and 3 migraine days are needed for a suggestion.',
        de: 'Erfasste Tage: {days}, davon mit Migräne: {mig}. Für eine Empfehlung braucht es mindestens 14 Tage und 3 Migränetage.',
    },
    'health.analysis.result': {
        en: 'Days recorded: {days}, with migraine: {mig}. Largest 6 h change on migraine days {avgMig} hPa, on other days {avgOther} hPa. Suggested sensitivity: {sens}.',
        de: 'Erfasste Tage: {days}, davon mit Migräne: {mig}. Größte 6-h-Änderung an Migränetagen {avgMig} hPa, an anderen Tagen {avgOther} hPa. Empfohlene Empfindlichkeit: {sens}.',
    },
    'sensitivity.low': { en: 'low', de: 'niedrig' },
    'sensitivity.normal': { en: 'normal', de: 'normal' },
    'sensitivity.high': { en: 'high', de: 'hoch' },

    'summary.none': { en: 'No warnings', de: 'Keine Warnungen' },
};

const ZAMBRETTI_DE = [
    'Beständig schön',
    'Schönes Wetter',
    'Wird schön',
    'Schön, wird unbeständiger',
    'Schön, Schauer möglich',
    'Ziemlich schön, bessert sich',
    'Ziemlich schön, anfangs Schauer möglich',
    'Ziemlich schön, später Schauer',
    'Anfangs Schauer, bessert sich',
    'Wechselhaft, bessert sich',
    'Ziemlich schön, Schauer wahrscheinlich',
    'Eher unbeständig, später aufklarend',
    'Unbeständig, bessert sich wahrscheinlich',
    'Schauer mit Aufheiterungen',
    'Schauer, wird unbeständiger',
    'Wechselhaft, etwas Regen',
    'Unbeständig, kurze schöne Abschnitte',
    'Unbeständig, später Regen',
    'Unbeständig, etwas Regen',
    'Überwiegend sehr unbeständig',
    'Zeitweise Regen, verschlechtert sich',
    'Zeitweise Regen, sehr unbeständig',
    'Häufig Regen',
    'Regen, sehr unbeständig',
    'Stürmisch, bessert sich vielleicht',
    'Stürmisch, viel Regen',
];

export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
    const entry = TEXTS[key];
    let text = entry ? entry[lang] || entry.en : key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            const str = typeof v === 'number' && lang === 'de' ? String(v).replace('.', ',') : String(v);
            text = text.replace(`{${k}}`, str);
        }
    }
    return text;
}

export function zambrettiText(index: number, lang: Lang): string {
    return (lang === 'de' ? ZAMBRETTI_DE[index] : ZAMBRETTI_FORECASTS[index]) || '';
}
