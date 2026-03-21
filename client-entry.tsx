import { ensureSidebarButton } from './src/sidebar-button';
import { openModal } from './src/sidebar-panel';
import { startTracking, stopTracking } from './src/page-tracker';

let abortController: AbortController | null = null;

function setupSidebar(): void {
  ensureSidebarButton(() => openModal());
}

const activate = (): void => {
  setupSidebar();
  startTracking();

  // Re-ensure button on every navigation (handles React re-renders)
  if (window.navigation) {
    abortController = new AbortController();
    window.navigation.addEventListener(
      'navigatesuccess',
      () => ensureSidebarButton(() => openModal()),
      { signal: abortController.signal },
    );
  }
};

const deactivate = (): void => {
  stopTracking();
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
};

// Register plugin with Growi
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-recently-viewed-pages'] = {
  activate,
  deactivate,
};

export {};
