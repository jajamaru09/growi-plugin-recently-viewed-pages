import { log } from './logger';

const BUTTON_ID = 'recently-viewed';

let onClickHandler: (() => void) | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function createButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary m-1 rounded';
  btn.id = BUTTON_ID;
  btn.innerHTML = '<div class="position-relative"><span class="material-symbols-outlined">history</span></div>';

  btn.addEventListener('click', () => {
    onClickHandler?.();
  });

  return btn;
}

function tryInsertButton(): HTMLButtonElement | null {
  const existing = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (existing && document.body.contains(existing)) {
    log('button: already exists in DOM');
    return existing;
  }

  existing?.remove();

  const notificationBtn = document.getElementById('in-app-notification');
  if (!notificationBtn) {
    log('button: notification button not found yet');
    return null;
  }

  const btn = createButton();
  notificationBtn.insertAdjacentElement('afterend', btn);
  log('button: inserted next to notification button');
  return btn;
}

/**
 * ボタンの配置を保証する。通知ボタンが見つからない場合はリトライする。
 */
export function ensureSidebarButton(onClick: () => void, maxRetries = 10): void {
  onClickHandler = onClick;

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  const btn = tryInsertButton();
  if (btn) return;

  let attempt = 0;
  function retry(): void {
    attempt++;
    log('button: retry', attempt, '/', maxRetries);
    const result = tryInsertButton();
    if (result || attempt >= maxRetries) {
      retryTimer = null;
      if (!result) {
        log('button: gave up after', maxRetries, 'retries');
      }
      return;
    }
    retryTimer = setTimeout(retry, 500);
  }
  retryTimer = setTimeout(retry, 500);
}

/**
 * ボタンをDOMから除去し、リトライも停止する。
 */
export function removeSidebarButton(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  const btn = document.getElementById(BUTTON_ID);
  btn?.remove();
  log('button: removed');
}
