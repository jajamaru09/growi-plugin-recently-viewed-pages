export const STORAGE_KEY = 'growi-recently-viewed-pages';
export const MAX_ITEMS = 100;

export type ViewedPage = {
  path: string;
  title: string;
  viewedAt: number;
};

export function getHistory(): ViewedPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function recordPageView(path: string, title: string): void {
  try {
    const history = getHistory().filter((item) => item.path !== path);
    history.unshift({ path, title, viewedAt: Date.now() });
    if (history.length > MAX_ITEMS) {
      history.length = MAX_ITEMS;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

// Search keyword history
export const SEARCH_HISTORY_KEY = 'growi-recently-viewed-search-history';
export const MAX_SEARCH_KEYWORDS = 10;

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function recordSearchKeyword(keyword: string): void {
  try {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const history = getSearchHistory().filter((k) => k !== trimmed);
    history.unshift(trimmed);
    if (history.length > MAX_SEARCH_KEYWORDS) {
      history.length = MAX_SEARCH_KEYWORDS;
    }
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable
  }
}

export function removeSearchKeyword(keyword: string): void {
  try {
    const history = getSearchHistory().filter((k) => k !== keyword);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // localStorage unavailable
  }
}
