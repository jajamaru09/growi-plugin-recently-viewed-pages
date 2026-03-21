const BUTTON_ID = 'recently-viewed';

export function injectSidebarButton(onClick: () => void): HTMLButtonElement | null {
  const notificationBtn = document.getElementById('in-app-notification');
  if (!notificationBtn) return null;

  // Avoid duplicate injection
  if (document.getElementById(BUTTON_ID)) {
    return document.getElementById(BUTTON_ID) as HTMLButtonElement;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary m-1 rounded';
  btn.id = BUTTON_ID;
  btn.innerHTML = '<div class="position-relative"><span class="material-symbols-outlined">history</span></div>';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  // Insert after the notification button
  notificationBtn.insertAdjacentElement('afterend', btn);
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
