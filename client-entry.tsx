import { ensureSidebarButton, setButtonActive } from './src/sidebar-button';
import { showPanel, hidePanel } from './src/sidebar-panel';
import { startTracking, stopTracking } from './src/page-tracker';

let isActive = false;
let abortController: AbortController | null = null;

function handleButtonClick(): void {
  isActive = true;
  setButtonActive(true);
  showPanel();
}

function setupSidebar(): void {
  const btn = ensureSidebarButton(handleButtonClick);
  if (!btn) return;

  // Listen for clicks on other sidebar nav buttons to deactivate our panel
  const navContainer = btn.parentElement;
  if (navContainer) {
    navContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const clickedBtn = target.closest('button');
      if (clickedBtn && clickedBtn.id !== 'recently-viewed' && isActive) {
        isActive = false;
        setButtonActive(false);
        hidePanel();
      }
    });
  }
}

function onNavigate(): void {
  // Re-ensure button exists after each navigation (React may have re-rendered)
  ensureSidebarButton(handleButtonClick);

  // If our panel is active, refresh it to show updated history
  if (isActive) {
    showPanel();
  }
}

const activate = (): void => {
  setupSidebar();
  startTracking();

  // Re-ensure button on every navigation (handles React re-renders)
  if (window.navigation) {
    abortController = new AbortController();
    window.navigation.addEventListener(
      'navigatesuccess',
      () => onNavigate(),
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
