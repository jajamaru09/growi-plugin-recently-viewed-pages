import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { recordPageView, getHistory, clearHistory, STORAGE_KEY, MAX_ITEMS, getSearchHistory, recordSearchKeyword, removeSearchKeyword, clearSearchHistory, SEARCH_HISTORY_KEY, MAX_SEARCH_KEYWORDS } from './storage';

describe('storage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records a page view and retrieves it', () => {
    recordPageView('/test/page', 'page');
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].path).toBe('/test/page');
    expect(history[0].title).toBe('page');
    expect(typeof history[0].viewedAt).toBe('number');
  });

  it('returns empty array when no history', () => {
    expect(getHistory()).toEqual([]);
  });

  it('updates viewedAt when same path is recorded again', () => {
    vi.setSystemTime(new Date('2026-03-21T10:00:00'));
    recordPageView('/test/page', 'page');
    const first = getHistory()[0].viewedAt;

    vi.setSystemTime(new Date('2026-03-21T10:05:00'));
    recordPageView('/test/page', 'page');
    const second = getHistory()[0].viewedAt;

    expect(second).toBeGreaterThan(first);
    expect(getHistory()).toHaveLength(1);
  });

  it('sorts by viewedAt descending (most recent first)', () => {
    recordPageView('/a', 'a');
    vi.advanceTimersByTime(1000);
    recordPageView('/b', 'b');
    vi.advanceTimersByTime(1000);
    recordPageView('/c', 'c');
    const history = getHistory();
    expect(history[0].path).toBe('/c');
    expect(history[2].path).toBe('/a');
  });

  it('enforces max items limit', () => {
    for (let i = 0; i < MAX_ITEMS + 5; i++) {
      recordPageView(`/page/${i}`, `${i}`);
    }
    expect(getHistory()).toHaveLength(MAX_ITEMS);
  });

  it('clears all history', () => {
    recordPageView('/a', 'a');
    recordPageView('/b', 'b');
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(getHistory()).toEqual([]);
  });
});

describe('search keyword history', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no search history', () => {
    expect(getSearchHistory()).toEqual([]);
  });

  it('records a search keyword', () => {
    recordSearchKeyword('react');
    expect(getSearchHistory()).toEqual(['react']);
  });

  it('places newest keyword first', () => {
    recordSearchKeyword('react');
    recordSearchKeyword('vue');
    expect(getSearchHistory()).toEqual(['vue', 'react']);
  });

  it('deduplicates keywords and moves to top', () => {
    recordSearchKeyword('react');
    recordSearchKeyword('vue');
    recordSearchKeyword('react');
    expect(getSearchHistory()).toEqual(['react', 'vue']);
  });

  it('trims whitespace and ignores empty strings', () => {
    recordSearchKeyword('  react  ');
    expect(getSearchHistory()).toEqual(['react']);
    recordSearchKeyword('   ');
    expect(getSearchHistory()).toEqual(['react']);
    recordSearchKeyword('');
    expect(getSearchHistory()).toEqual(['react']);
  });

  it('enforces max keywords limit', () => {
    for (let i = 0; i < 15; i++) {
      recordSearchKeyword(`keyword${i}`);
    }
    expect(getSearchHistory()).toHaveLength(MAX_SEARCH_KEYWORDS);
    expect(getSearchHistory()[0]).toBe('keyword14');
  });

  it('removes a specific keyword', () => {
    recordSearchKeyword('react');
    recordSearchKeyword('vue');
    recordSearchKeyword('angular');
    removeSearchKeyword('vue');
    expect(getSearchHistory()).toEqual(['angular', 'react']);
  });

  it('clears all search history', () => {
    recordSearchKeyword('react');
    recordSearchKeyword('vue');
    clearSearchHistory();
    expect(getSearchHistory()).toEqual([]);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(SEARCH_HISTORY_KEY, 'not-json');
    expect(getSearchHistory()).toEqual([]);
  });
});
