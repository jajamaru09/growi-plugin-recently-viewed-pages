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
