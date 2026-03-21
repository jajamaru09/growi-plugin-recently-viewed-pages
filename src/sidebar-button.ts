const BUTTON_ID = 'recently-viewed';

let onClickHandler: (() => void) | null = null;

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

export function ensureSidebarButton(onClick: () => void): HTMLButtonElement | null {
  onClickHandler = onClick;

  // Already exists
  const existing = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (existing) return existing;

  // Find anchor point
  const notificationBtn = document.getElementById('in-app-notification');
  if (!notificationBtn) return null;

  const btn = createButton();
  notificationBtn.insertAdjacentElement('afterend', btn);
  return btn;
}

export function setButtonActive(active: boolean): void {
  const btn = document.getElementById(BUTTON_ID);
  if (!btn) return;

  if (active) {
    const container = btn.parentElement;
    if (container) {
      container.querySelectorAll('button.btn').forEach((b) => b.classList.remove('active'));
    }
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}
