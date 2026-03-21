import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { recordPageView, getHistory, clearHistory, STORAGE_KEY, MAX_ITEMS } from './storage';

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

  it('enforces max 30 items', () => {
    for (let i = 0; i < 35; i++) {
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
