import { checkManifest } from '@iobroker/web-components';
import type { Plugin, UserConfig } from 'vite';

// with the extension: Vite may load its config natively, without a bundler that would add it
import { iconSvg } from './src/icon.ts';
import { ICON_FILE, MANIFEST_FILE, MODULE_FILE } from './src/constants.ts';
import { MANIFEST } from './src/manifest.ts';

/**
 * The web component `<iob-weather-insights>`: one ES module, `admin/webcomponents/weather-insights.js`, with its manifest
 * `weather-insights.json` (`common.webComponents`) and its icon next to it. Every host - vis-2, devices, Aura, admin -
 * reads them from `/adapter/weather-insights/webcomponents/`.
 *
 * No framework and no React of the host: the module is plain DOM plus the bundled base class.
 */

/** Writes the manifest - checked like a host checks it - and the icon next to the module */
function manifestFiles(): Plugin {
    return {
        name: 'weather-insights-web-component-manifest',
        generateBundle() {
            const problem = checkManifest(MANIFEST);
            if (problem) {
                this.error(`${MANIFEST_FILE}: ${problem}`);
            }
            if (MANIFEST.module !== MODULE_FILE) {
                this.error(`${MANIFEST_FILE}: "module" must be "${MODULE_FILE}"`);
            }
            this.emitFile({
                type: 'asset',
                fileName: MANIFEST_FILE,
                source: `${JSON.stringify(MANIFEST, null, 4)}\n`,
            });
            this.emitFile({ type: 'asset', fileName: ICON_FILE, source: `${iconSvg()}\n` });
        },
    };
}

export default (): UserConfig => ({
    plugins: [manifestFiles()],
    publicDir: false,
    build: {
        target: 'es2022',
        outDir: '../admin/webcomponents',
        emptyOutDir: true,
        lib: {
            entry: './src/weather-insights.ts',
            formats: ['es'],
            fileName: (): string => MODULE_FILE,
        },
        rollupOptions: {
            output: {
                // one file: a host imports exactly one URL
                codeSplitting: false,
                // library mode keeps whitespace for the bundler of a consumer; this module is loaded as it is
                minify: true,
            },
        },
    },
});
