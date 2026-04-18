import { getHistory, clearHistory, type ViewedPage } from './storage';
import { formatRelativeTime } from './relative-time';
import { escapeHtml } from './html-escape';
import { getSearchHistory, saveSearchKeyword, removeSearchKeyword } from './search-history';
import { log } from './logger';
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

export function renderBody(filterKeyword?: string): string {
  let history = getHistory();

  if (filterKeyword) {
    const kw = filterKeyword.toLowerCase();
    history = history.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.path.toLowerCase().includes(kw),
    );
    log('filter:', filterKeyword, '→', history.length, 'items');
  } else {
    log('renderBody: no filter,', history.length, 'items');
  }

  if (history.length === 0) {
    const message = filterKeyword ? '該当する履歴はありません' : '閲覧履歴はありません';
    return `<div class="grw-recently-viewed-empty">${message}</div>`;
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
    const nextRouter = window.next?.router;
    if (nextRouter && typeof nextRouter.push === 'function') {
      nextRouter.push(path);
      return;
    }
  } catch {
    // fallback below
  }
  window.location.href = path;
}

// --- モーダル内部状態 ---
let modalBody: HTMLElement | null = null;
let searchInput: HTMLInputElement | null = null;
let dropdown: HTMLElement | null = null;
let eventsAttached = false;

function renderDropdown(): void {
  if (!dropdown) return;
  const keywords = getSearchHistory();
  log('showDropdown:', keywords.length, 'keywords');
  if (keywords.length === 0) {
    dropdown.classList.remove('active');
    return;
  }
  dropdown.innerHTML = keywords
    .map((kw) => `<div class="grw-rv-search-dropdown-item">
      <span class="grw-rv-dropdown-keyword">${escapeHtml(kw)}</span>
      <button type="button" class="grw-rv-dropdown-delete" title="削除">
        <span class="material-symbols-outlined" style="font-size:16px">close</span>
      </button>
    </div>`)
    .join('');
  dropdown.classList.add('active');
}

function hideDropdown(): void {
  dropdown?.classList.remove('active');
}

function applyFilter(keyword: string): void {
  if (!modalBody) return;
  log('applyFilter:', JSON.stringify(keyword));
  modalBody.innerHTML = renderBody(keyword || undefined);
}

function hideConfirmPopover(): void {
  const existing = document.querySelector('.grw-rv-confirm-popover');
  existing?.remove();
}

function showConfirmPopover(anchorBtn: HTMLElement): void {
  hideConfirmPopover();

  const popover = document.createElement('div');
  popover.className = 'grw-rv-confirm-popover';
  popover.innerHTML = `
    <div class="grw-rv-confirm-text">履歴を削除しますか？</div>
    <div class="d-flex gap-2 justify-content-end">
      <button type="button" class="btn btn-sm btn-outline-secondary grw-rv-confirm-cancel">キャンセル</button>
      <button type="button" class="btn btn-sm btn-danger grw-rv-confirm-ok">削除</button>
    </div>
  `;

  anchorBtn.closest('.d-flex')?.appendChild(popover);

  popover.querySelector('.grw-rv-confirm-cancel')!.addEventListener('click', (e) => {
    e.stopPropagation();
    hideConfirmPopover();
  });

  popover.querySelector('.grw-rv-confirm-ok')!.addEventListener('click', (e) => {
    e.stopPropagation();
    hideConfirmPopover();
    clearHistory();
    if (searchInput) searchInput.value = '';
    applyFilter('');
    log('history cleared');
  });
}

function attachModalEvents(
  modal: HTMLElement,
  input: HTMLInputElement,
  drop: HTMLElement,
): void {
  if (eventsAttached) return;
  eventsAttached = true;

  log('attachModalEvents: binding event listeners');

  input.addEventListener('focus', () => {
    renderDropdown();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const keyword = input.value.trim();
      log('search Enter:', JSON.stringify(keyword));
      if (keyword) {
        saveSearchKeyword(keyword);
      }
      applyFilter(keyword);
      hideDropdown();
    }
  });

  drop.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;

    const deleteBtn = target.closest('.grw-rv-dropdown-delete') as HTMLElement | null;
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const item = deleteBtn.closest('.grw-rv-search-dropdown-item') as HTMLElement;
      const keywordEl = item?.querySelector('.grw-rv-dropdown-keyword');
      const keyword = keywordEl?.textContent ?? '';
      log('delete search keyword:', JSON.stringify(keyword));
      removeSearchKeyword(keyword);
      renderDropdown();
      return;
    }

    const item = target.closest('.grw-rv-search-dropdown-item') as HTMLElement | null;
    if (item) {
      e.preventDefault();
      const keywordEl = item.querySelector('.grw-rv-dropdown-keyword');
      const keyword = keywordEl?.textContent ?? '';
      log('dropdown select:', JSON.stringify(keyword));
      input.value = keyword;
      saveSearchKeyword(keyword);
      applyFilter(keyword);
      hideDropdown();
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(hideDropdown, 150);
  });

  modal.addEventListener('mousedown', (e) => {
    if (e.target === modal) {
      hideConfirmPopover();
      closeModal();
    }
  });

  modal.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.closest('.grw-rv-confirm-popover')) return;
    if (target === modal) return;

    if (target.closest('.grw-rv-modal-close')) {
      hideConfirmPopover();
      closeModal();
      return;
    }

    if (target.closest('.grw-btn-clear-history')) {
      showConfirmPopover(target.closest('.grw-btn-clear-history') as HTMLElement);
      return;
    }

    const link = target.closest('.grw-rv-link') as HTMLElement | null;
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('data-rv-href');
      if (href) {
        hideConfirmPopover();
        closeModal();
        navigateGrowiStyle(href);
      }
    }
  });
}

function getOrCreateModal(): HTMLElement {
  let modal = document.getElementById(MODAL_ID);
  if (!modal) {
    log('creating modal DOM');
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
        <div class="grw-rv-search-section">
          <div class="grw-rv-search-wrapper">
            <span class="material-symbols-outlined grw-rv-search-icon">search</span>
            <input type="text" class="grw-rv-search-input" placeholder="検索..." />
            <div class="grw-rv-search-dropdown"></div>
          </div>
        </div>
        <div class="grw-rv-modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modalBody = modal.querySelector('.grw-rv-modal-body');
    searchInput = modal.querySelector('.grw-rv-search-input') as HTMLInputElement;
    dropdown = modal.querySelector('.grw-rv-search-dropdown') as HTMLElement;

    attachModalEvents(modal, searchInput, dropdown);
  }
  return modal;
}

export function openModal(): void {
  log('openModal');
  const modal = getOrCreateModal();

  if (searchInput) searchInput.value = '';
  if (modalBody) modalBody.innerHTML = renderBody();
  hideConfirmPopover();
  hideDropdown();

  modal.classList.add('active');
}

export function closeModal(): void {
  log('closeModal');
  const modal = document.getElementById(MODAL_ID);
  if (modal) {
    modal.classList.remove('active');
  }
  hideConfirmPopover();
}

export function removeModal(): void {
  log('removeModal');
  const modal = document.getElementById(MODAL_ID);
  if (modal) {
    modal.remove();
  }
  modalBody = null;
  searchInput = null;
  dropdown = null;
  eventsAttached = false;
}
