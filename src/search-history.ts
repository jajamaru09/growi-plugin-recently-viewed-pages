export const SEARCH_HISTORY_KEY = 'growi-rv-search-history';
export const MAX_SEARCH_HISTORY = 10;

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

export function saveSearchKeyword(keyword: string): void {
  const trimmed = keyword.trim();
  if (!trimmed) return;

  try {
    const history = getSearchHistory().filter((k) => k !== trimmed);
    history.unshift(trimmed);
    if (history.length > MAX_SEARCH_HISTORY) {
      history.length = MAX_SEARCH_HISTORY;
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
