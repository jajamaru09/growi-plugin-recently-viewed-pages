import { getHistory, clearHistory, type ViewedPage } from './storage';
import { formatRelativeTime } from './relative-time';
import { escapeHtml } from './html-escape';
import './styles.css';

const PANEL_ID = 'grw-recently-viewed-panel';

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

export function renderPanel(): string {
  const history = getHistory();

  const headerHtml = `
    <div class="grw-sidebar-content-header py-4 d-flex">
      <h3 class="fs-6 fw-bold mb-0 text-nowrap">閲覧履歴</h3>
      <button type="button" class="btn btn-sm ms-auto py-0 grw-btn-clear-history" title="履歴をクリア">
        <span class="material-symbols-outlined">delete_sweep</span>
      </button>
    </div>
  `;

  if (history.length === 0) {
    return `
      <div class="px-3">
        ${headerHtml}
        <div class="grw-recently-viewed-empty">閲覧履歴はありません</div>
      </div>
    `;
  }

  const listHtml = history.map(renderItem).join('');

  return `
    <div class="px-3">
      ${headerHtml}
      <div class="grw-recent-changes">
        <ul class="list-group list-group-flush">
          ${listHtml}
        </ul>
      </div>
    </div>
  `;
}

function navigateGrowiStyle(path: string): void {
  // Try Next.js router for SPA navigation (Growi uses Next.js)
  try {
    const nextRouter = (window as any).next?.router;
    if (nextRouter && typeof nextRouter.push === 'function') {
      nextRouter.push(path);
      return;
    }
  } catch {
    // fallback below
  }

  // Fallback: standard navigation
  window.location.href = path;
}

function getOrCreatePanel(): HTMLElement {
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'grw-recently-viewed-panel d-none';
    panel.style.cssText = 'height:100%;overflow-y:auto;';

    // Insert as sibling of .grw-sidebar-contents inside the scrollable area
    const sidebarContents = document.querySelector('.grw-sidebar-contents');
    if (sidebarContents && sidebarContents.parentElement) {
      sidebarContents.parentElement.appendChild(panel);
    }
  }
  return panel;
}

export function showPanel(): void {
  const panel = getOrCreatePanel();
  const sidebarContents = document.querySelector('.grw-sidebar-contents');

  // Render content
  panel.innerHTML = renderPanel();

  // Show our panel, hide Growi's panel
  panel.classList.remove('d-none');
  if (sidebarContents) {
    sidebarContents.classList.add('d-none');
  }

  // Event delegation for all interactions
  panel.onclick = (e) => {
    const target = e.target as HTMLElement;

    // Handle clear button
    if (target.closest('.grw-btn-clear-history')) {
      clearHistory();
      showPanel(); // refresh
      return;
    }

    // Handle navigation links
    const link = target.closest('.grw-rv-link') as HTMLElement | null;
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('data-rv-href');
      if (href) {
        navigateGrowiStyle(href);
      }
    }
  };
}

export function hidePanel(): void {
  const panel = document.getElementById(PANEL_ID);
  const sidebarContents = document.querySelector('.grw-sidebar-contents');

  if (panel) {
    panel.classList.add('d-none');
  }
  if (sidebarContents) {
    sidebarContents.classList.remove('d-none');
  }
}
