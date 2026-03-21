const BUTTON_ID = 'recently-viewed';

let onClickHandler: (() => void) | null = null;
let buttonObserver: MutationObserver | null = null;

function createButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary m-1 rounded';
  btn.id = BUTTON_ID;
  btn.innerHTML = '<div class="position-relative"><span class="material-symbols-outlined">history</span></div>';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClickHandler?.();
  });

  return btn;
}

function ensureButtonExists(): void {
  if (document.getElementById(BUTTON_ID)) return;

  const notificationBtn = document.getElementById('in-app-notification');
  if (!notificationBtn) return;

  const btn = createButton();
  notificationBtn.insertAdjacentElement('afterend', btn);
}

export function injectSidebarButton(onClick: () => void): HTMLButtonElement | null {
  onClickHandler = onClick;

  const notificationBtn = document.getElementById('in-app-notification');
  if (!notificationBtn) return null;

  // Avoid duplicate injection
  if (document.getElementById(BUTTON_ID)) {
    return document.getElementById(BUTTON_ID) as HTMLButtonElement;
  }

  const btn = createButton();
  notificationBtn.insertAdjacentElement('afterend', btn);

  // Watch for React re-renders that might remove our button
  const navContainer = notificationBtn.closest('.grw-sidebar-nav-primary-container');
  if (navContainer && !buttonObserver) {
    buttonObserver = new MutationObserver(() => {
      ensureButtonExists();
    });
    buttonObserver.observe(navContainer, { childList: true, subtree: true });
  }

  return btn;
}

export function setButtonActive(active: boolean): void {
  const btn = document.getElementById(BUTTON_ID);
  if (!btn) return;

  if (active) {
    // Remove active from all sibling nav buttons
    const container = btn.parentElement;
    if (container) {
      container.querySelectorAll('button.btn').forEach((b) => b.classList.remove('active'));
    }
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}

export function cleanupButtonObserver(): void {
  if (buttonObserver) {
    buttonObserver.disconnect();
    buttonObserver = null;
  }
}
