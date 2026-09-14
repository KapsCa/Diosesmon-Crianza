/// <reference types="vite/client" />

/**
 * The release version, injected at build time by `vite.config.ts` reading
 * `package.json`. Declared here so components can read it as a plain literal:
 * importing the manifest into the app would bundle the whole file into the
 * client and ship build metadata to the browser.
 */
declare const __APP_VERSION__: string
