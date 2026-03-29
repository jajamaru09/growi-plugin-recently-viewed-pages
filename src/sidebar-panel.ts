import { getHistory, clearHistory, getSearchHistory, recordSearchKeyword, removeSearchKeyword, type ViewedPage } from './storage';
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

function buildFullPath(path: string, title: string): string {
  const segments = path.split('/').filter(Boolean);
  let currentPath = '';
  const links = segments.map((seg, i) => {
    currentPath += '/' + seg;
    // Use stored title for the last segment (avoids showing raw pageId)
    const label = (i === segments.length - 1) ? title : safeDecodeURI(seg);
    return `<a class="grw-rv-link" data-rv-href="${escapeHtml(currentPath)}">${escapeHtml(label)}</a>`;
  });

  const homeLink = `<a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span></a>`;
  const sep = '<span class="grw-rv-sep">/</span>';

  return homeLink + sep + links.join(sep);
}

function renderItem(item: ViewedPage): string {
  const fullPath = buildFullPath(item.path, item.title);
  const relativeTime = formatRelativeTime(item.viewedAt);

  return `
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex align-items-baseline ms-2">
        <div class="flex-grow-1 grw-rv-full-path">${fullPath}</div>
        <div class="grw-formatted-distance-date ms-3 text-nowrap">
          <span>${escapeHtml(relativeTime)}</span>
        </div>
      </div>
    </li>
  `;
}

export function renderBody(searchQuery: string = ''): string {
  const history = getHistory();

  if (history.length === 0) {
    return '<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>';
  }

  // Filter items based on search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredHistory = trimmedQuery
    ? history.filter(item =>
        item.title.toLowerCase().includes(trimmedQuery) ||
        item.path.toLowerCase().includes(trimmedQuery)
      )
    : history;

  if (filteredHistory.length === 0) {
    return '<div class="grw-recently-viewed-empty">該当する履歴が見つかりません</div>';
  }

  const listHtml = filteredHistory.map(renderItem).join('');
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

function renderSearchHistoryDropdown(): string {
  const keywords = getSearchHistory();
  if (keywords.length === 0) return '';
  const items = keywords.map((kw) =>
    `<div class="grw-rv-search-history-item">
      <span class="grw-rv-search-history-keyword">${escapeHtml(kw)}</span>
      <button type="button" class="grw-rv-search-history-remove" data-keyword="${escapeHtml(kw)}" title="削除">✕</button>
    </div>`
  ).join('');
  return `<div class="grw-rv-search-history-dropdown">${items}</div>`;
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
        <div class="grw-rv-search-container">
          <input type="text" class="grw-rv-search-input" placeholder="ページを検索..." autocomplete="off">
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
  const searchInput = modal.querySelector('.grw-rv-search-input') as HTMLInputElement;
  const searchContainer = modal.querySelector('.grw-rv-search-container')!;

  // Initialize the list
  body.innerHTML = renderBody();

  // Clear any previous search value and dropdown
  if (searchInput) {
    searchInput.value = '';
  }
  const existingDropdown = searchContainer.querySelector('.grw-rv-search-history-dropdown');
  if (existingDropdown) existingDropdown.remove();

  modal.classList.add('active');

  function showDropdown(): void {
    hideDropdown();
    if (searchInput && searchInput.value.trim() !== '') return;
    const html = renderSearchHistoryDropdown();
    if (!html) return;
    searchContainer.insertAdjacentHTML('beforeend', html);
  }

  function hideDropdown(): void {
    const dd = searchContainer.querySelector('.grw-rv-search-history-dropdown');
    if (dd) dd.remove();
  }

  // Handle search input changes
  const handleSearch = () => {
    const query = searchInput ? searchInput.value : '';
    body.innerHTML = renderBody(query);
    hideDropdown();
  };

  // Real-time filtering on input
  if (searchInput) {
    searchInput.oninput = handleSearch;
    searchInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmed = searchInput.value.trim();
        if (trimmed) {
          recordSearchKeyword(trimmed);
        }
      }
    };
    searchInput.onfocus = () => {
      if (searchInput.value.trim() === '') {
        showDropdown();
      }
    };
  }

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
      const query = searchInput ? searchInput.value : '';
      body.innerHTML = renderBody(query);
      return;
    }

    // Search history: remove keyword
    const removeBtn = target.closest('.grw-rv-search-history-remove') as HTMLElement | null;
    if (removeBtn) {
      const keyword = removeBtn.getAttribute('data-keyword');
      if (keyword) {
        removeSearchKeyword(keyword);
        showDropdown();
      }
      return;
    }

    // Search history: select keyword
    const historyItem = target.closest('.grw-rv-search-history-item') as HTMLElement | null;
    if (historyItem) {
      const keywordEl = historyItem.querySelector('.grw-rv-search-history-keyword');
      if (keywordEl && searchInput) {
        searchInput.value = keywordEl.textContent || '';
        hideDropdown();
        body.innerHTML = renderBody(searchInput.value);
      }
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

    // Click inside modal but outside dropdown: hide dropdown
    if (!target.closest('.grw-rv-search-history-dropdown') && !target.closest('.grw-rv-search-input')) {
      hideDropdown();
    }
  };
}

function closeModal(): void {
  const modal = document.getElementById(MODAL_ID);
  if (modal) {
    modal.classList.remove('active');
  }
}
