import { getHistory, clearHistory, type ViewedPage } from './storage';
import { formatRelativeTime } from './relative-time';
import { escapeHtml } from './html-escape';
import './styles.css';

const MODAL_ID = 'grw-recently-viewed-modal';

function safeDecodeURI(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

function buildPathHierarchy(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return '';

  const parentSegments = segments.slice(0, -1);
  let currentPath = '';
  const links = parentSegments.map((seg) => {
    currentPath += '/' + seg;
    const decoded = safeDecodeURI(seg);
    return `<a class="page-segment grw-rv-link" data-rv-href="${escapeHtml(currentPath)}">${escapeHtml(decoded)}</a>`;
  });

  return `<span class="path-segment"><a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${links.join('<span class="separator" style="margin:0 0.2em">/</span>')}`;
}

function renderItem(item: ViewedPage): string {
  const pathHierarchy = buildPathHierarchy(item.path);
  const relativeTime = formatRelativeTime(item.viewedAt);

  return `
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${pathHierarchy ? `<div class="col-12"><div style="font-size:0.85em;color:#888">${pathHierarchy}</div></div>` : ''}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment grw-rv-link" data-rv-href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>
            </h6>
            <div class="col-12">
              <div class="d-flex justify-content-end">
                <div class="grw-formatted-distance-date mt-auto">
                  <span>${escapeHtml(relativeTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  `;
}

export function renderBody(): string {
  const history = getHistory();

  if (history.length === 0) {
    return '<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>';
  }

  const listHtml = history.map(renderItem).join('');
  return `
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${listHtml}
      </ul>
    </div>
  `;
}

function navigateGrowiStyle(path: string): void {
  try {
    const nextRouter = (window as any).next?.router;
    if (nextRouter && typeof nextRouter.push === 'function') {
      nextRouter.push(path);
      return;
    }
  } catch {
    // fallback below
  }
  window.location.href = path;
}

function getOrCreateModal(): HTMLElement {
  let modal = document.getElementById(MODAL_ID);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'grw-rv-modal-backdrop';

    modal.innerHTML = `
      <div class="grw-rv-modal">
        <div class="grw-rv-modal-header">
          <h5 class="fw-bold mb-0">閲覧履歴</h5>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary grw-btn-clear-history" title="履歴をクリア">
              <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">delete_sweep</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary grw-rv-modal-close" title="閉じる">
              <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">close</span>
            </button>
          </div>
        </div>
        <div class="grw-rv-modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);
  }
  return modal;
}

export function openModal(): void {
  const modal = getOrCreateModal();
  const body = modal.querySelector('.grw-rv-modal-body')!;
  body.innerHTML = renderBody();

  modal.classList.add('active');

  modal.onclick = (e) => {
    const target = e.target as HTMLElement;

    // Close on backdrop click
    if (target === modal) {
      closeModal();
      return;
    }

    // Close button
    if (target.closest('.grw-rv-modal-close')) {
      closeModal();
      return;
    }

    // Clear history
    if (target.closest('.grw-btn-clear-history')) {
      clearHistory();
      body.innerHTML = renderBody();
      return;
    }

    // Navigation links
    const link = target.closest('.grw-rv-link') as HTMLElement | null;
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('data-rv-href');
      if (href) {
        closeModal();
        navigateGrowiStyle(href);
      }
    }
  };
}

function closeModal(): void {
  const modal = document.getElementById(MODAL_ID);
  if (modal) {
    modal.classList.remove('active');
  }
}
