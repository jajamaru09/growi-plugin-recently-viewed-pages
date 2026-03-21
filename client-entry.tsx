import { ensureSidebarButton, setButtonActive } from './src/sidebar-button';
import { showPanel, hidePanel } from './src/sidebar-panel';
import { startTracking, stopTracking } from './src/page-tracker';

let isActive = false;
let abortController: AbortController | null = null;

function handleButtonClick(): void {
  if (isActive) {
    setButtonActive(false);
    hidePanel();
    isActive = false;
    return;
  }

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

function waitForSidebar(): void {
  const navContainer = document.querySelector('.grw-sidebar-nav-primary-container');
  if (navContainer && document.getElementById('in-app-notification')) {
    setupSidebar();
    return;
  }

  // Wait for Growi's React to render the sidebar
  const observer = new MutationObserver((_mutations, obs) => {
    const nav = document.querySelector('.grw-sidebar-nav-primary-container');
    if (nav && document.getElementById('in-app-notification')) {
      obs.disconnect();
      setupSidebar();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

const activate = (): void => {
  waitForSidebar();
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
