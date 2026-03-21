import { injectSidebarButton, setButtonActive, cleanupButtonObserver } from './src/sidebar-button';
import { showPanel, hidePanel } from './src/sidebar-panel';
import { startTracking, stopTracking } from './src/page-tracker';

let isActive = false;
let observer: MutationObserver | null = null;

function handleButtonClick(): void {
  if (isActive) {
    // Deactivate — show Growi's native panel, hide ours
    setButtonActive(false);
    hidePanel();
    isActive = false;
    return;
  }

  isActive = true;
  setButtonActive(true);
  showPanel();
}

function setupSidebarIntegration(): void {
  const btn = injectSidebarButton(handleButtonClick);
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

function waitForSidebar(): void {
  // Check if sidebar already exists
  const navContainer = document.querySelector('.grw-sidebar-nav-primary-container');
  if (navContainer && document.getElementById('in-app-notification')) {
    setupSidebarIntegration();
    return;
  }

  // Otherwise, wait for it with MutationObserver
  observer = new MutationObserver((_mutations, obs) => {
    const nav = document.querySelector('.grw-sidebar-nav-primary-container');
    if (nav && document.getElementById('in-app-notification')) {
      obs.disconnect();
      observer = null;
      setupSidebarIntegration();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

const activate = (): void => {
  waitForSidebar();
  startTracking();
};

const deactivate = (): void => {
  stopTracking();
  cleanupButtonObserver();
  if (observer) {
    observer.disconnect();
    observer = null;
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
