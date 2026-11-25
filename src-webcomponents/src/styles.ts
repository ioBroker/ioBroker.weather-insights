/**
 * The styles in the shadow root. Colors come from the theme of the host (`--iob-*`, set by the base class), sizes
 * from the box of the host (container queries) - the element never measures itself.
 */
export const STYLES = `
:host {
    display: block;
    width: 100%;
    height: 100%;
    container-type: size;
    --lvl0: var(--iob-success, #2e7d32);
    --lvl1: #c9a227;
    --lvl2: var(--iob-warning, #ed6c02);
    --lvl3: var(--iob-error, #d32f2f);
    --lvl4: #9c27b0;
}
.root {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 2.5cqmin;
    padding: 3cqmin;
    color: var(--iob-text);
    font-family: var(--iob-font-family, sans-serif);
    font-size: clamp(10px, 3.6cqmin, 18px);
    overflow: hidden;
}
.message {
    margin: auto;
    color: var(--iob-text-secondary);
    text-align: center;
}
.head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 3cqmin;
    row-gap: 0.5em;
}
.value {
    white-space: nowrap;
}
.big {
    font-size: 2.1em;
    font-weight: 600;
    line-height: 1;
}
.unit {
    margin-left: 0.25em;
    color: var(--iob-text-secondary);
}
.trend {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
}
.trend svg {
    width: 1.3em;
    height: 1.3em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}
.falling {
    color: var(--lvl3);
}
.rising {
    color: var(--iob-info, #0288d1);
}
.steady {
    color: var(--iob-text-secondary);
}
.zambretti {
    flex-basis: 100%;
    color: var(--iob-text-secondary);
}
.zambretti b {
    color: var(--iob-text);
    font-weight: 600;
}
.chart {
    flex: 1 1 0;
    min-height: 4em;
}
.chart svg {
    width: 100%;
    height: 100%;
    display: block;
}
.grid {
    stroke: var(--iob-divider, rgba(127, 127, 127, 0.25));
    stroke-width: 1;
}
.axis {
    fill: var(--iob-text-secondary);
    font-size: 11px;
}
.midnight {
    stroke: var(--iob-divider, rgba(127, 127, 127, 0.35));
    stroke-dasharray: 3 3;
}
.now {
    stroke: var(--iob-text-secondary);
    stroke-dasharray: 2 2;
}
.past {
    fill: none;
    stroke: var(--iob-primary, #1976d2);
    stroke-width: 2.5;
    stroke-linejoin: round;
}
.future {
    fill: none;
    stroke: var(--iob-primary, #1976d2);
    stroke-width: 2.5;
    stroke-dasharray: 6 4;
    stroke-linejoin: round;
    opacity: 0.75;
}
.band {
    opacity: 0.18;
}
.warnings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
}
.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    padding: 0.2em 0.6em;
    border-radius: 999px;
    border: 1px solid currentColor;
    font-size: 0.9em;
}
.none {
    color: var(--iob-text-secondary);
}
.health-title {
    color: var(--iob-text-secondary);
    font-size: 0.85em;
}
.health {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7em, 1fr));
    gap: 0.5em;
}
.day {
    border: 1px solid var(--iob-divider, rgba(127, 127, 127, 0.3));
    border-radius: calc(var(--iob-border-radius, 4px) * 2);
    padding: 0.45em 0.6em;
    min-width: 0;
}
.day-name {
    color: var(--iob-text-secondary);
    font-size: 0.85em;
}
.level {
    display: flex;
    align-items: center;
    gap: 0.35em;
    font-weight: 600;
}
.dot {
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
    background: currentColor;
    flex: none;
}
.detail {
    font-size: 0.85em;
    color: var(--iob-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
}
.l0 { color: var(--lvl0); }
.l1 { color: var(--lvl1); }
.l2 { color: var(--lvl2); }
.l3 { color: var(--lvl3); }
.l4 { color: var(--lvl4); }
.band.l0 { fill: var(--lvl0); }
.band.l1 { fill: var(--lvl1); }
.band.l2 { fill: var(--lvl2); }
.band.l3 { fill: var(--lvl3); }
.band.l4 { fill: var(--lvl4); }
@container (max-height: 260px) {
    .health-title { display: none; }
}
`;
