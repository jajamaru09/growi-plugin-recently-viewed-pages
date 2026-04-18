import type { GrowiPluginHub } from './types';

declare global {
  interface Window {
    navigation?: EventTarget & {
      addEventListener: EventTarget['addEventListener'];
      removeEventListener: EventTarget['removeEventListener'];
    };
    growiPluginHub?: Partial<GrowiPluginHub> & { _queue?: unknown[] };
    pluginActivators?: Record<string, { activate: () => void; deactivate: () => void }>;
    next?: { router?: { push(path: string): void } };
  }
}
