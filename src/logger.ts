export const PLUGIN_NAME = 'growi-plugin-recently-viewed-pages';

const HUB_SETTINGS_KEY = 'growiPluginHub:settings';

/**
 * Log via hub if available; otherwise consult hub's persisted settings in localStorage
 * to respect the same debug gating. When settings aren't present or debug is off, stay silent.
 */
export function log(...args: unknown[]): void {
  const hub = window.growiPluginHub;
  if (hub?.log) {
    hub.log(PLUGIN_NAME, ...args);
    return;
  }
  try {
    const raw = localStorage.getItem(HUB_SETTINGS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { debug?: boolean; debugPlugins?: string[] };
    if (parsed.debug !== true) return;
    if (Array.isArray(parsed.debugPlugins) && parsed.debugPlugins.includes(PLUGIN_NAME)) return;
    console.log(`[${PLUGIN_NAME}]`, ...args);
  }
  catch {
    // localStorage unavailable or malformed settings — stay silent
  }
}
