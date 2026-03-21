import { getHistory, clearHistory, type ViewedPage } from './storage';
import { formatRelativeTime } from './relative-time';
import { escapeHtml } from './html-escape';
import './styles.css';

function buildPathHierarchy(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return '';

  const parentSegments = segments.slice(0, -1);
  let currentPath = '';
  const links = parentSegments.map((seg) => {
    currentPath += '/' + encodeURIComponent(decodeURIComponent(seg));
    const decoded = decodeURIComponent(seg);
    return `<a class="page-segment" href="${escapeHtml(currentPath)}">${escapeHtml(decoded)}</a>`;
  });

  return `<span class="path-segment"><a href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${links.join('<span class="separator" style="margin:0 0.2em">/</span>')}`;
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
              <a class="page-segment" href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>
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

export function showPanel(container: Element): void {
  const refresh = () => showPanel(container);

  container.innerHTML = renderPanel();

  // Attach clear button handler
  const clearBtn = container.querySelector('.grw-btn-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearHistory();
      refresh();
    });
  }
}
