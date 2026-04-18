import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSearchHistory,
  saveSearchKeyword,
  removeSearchKeyword,
  SEARCH_HISTORY_KEY,
  MAX_SEARCH_HISTORY,
} from './search-history';

describe('search-history', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no history', () => {
    expect(getSearchHistory()).toEqual([]);
  });

  it('saves and retrieves a keyword', () => {
    saveSearchKeyword('React');
    expect(getSearchHistory()).toEqual(['React']);
  });

  it('ignores empty string', () => {
    saveSearchKeyword('');
    expect(getSearchHistory()).toEqual([]);
  });

  it('ignores whitespace-only string', () => {
    saveSearchKeyword('   ');
    expect(getSearchHistory()).toEqual([]);
  });

  it('puts newest keyword first', () => {
    saveSearchKeyword('first');
    saveSearchKeyword('second');
    expect(getSearchHistory()).toEqual(['second', 'first']);
  });

  it('moves duplicate keyword to front', () => {
    saveSearchKeyword('aaa');
    saveSearchKeyword('bbb');
    saveSearchKeyword('aaa');
    expect(getSearchHistory()).toEqual(['aaa', 'bbb']);
  });

  it('enforces max 10 items', () => {
    for (let i = 0; i < 12; i++) {
      saveSearchKeyword(`kw${i}`);
    }
    const history = getSearchHistory();
    expect(history).toHaveLength(MAX_SEARCH_HISTORY);
    expect(history[0]).toBe('kw11');
    expect(history[9]).toBe('kw2');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(SEARCH_HISTORY_KEY, 'not-json');
    expect(getSearchHistory()).toEqual([]);
  });

  it('removes a specific keyword', () => {
    saveSearchKeyword('aaa');
    saveSearchKeyword('bbb');
    saveSearchKeyword('ccc');
    removeSearchKeyword('bbb');
    expect(getSearchHistory()).toEqual(['ccc', 'aaa']);
  });

  it('removes keyword that does not exist without error', () => {
    saveSearchKeyword('aaa');
    removeSearchKeyword('zzz');
    expect(getSearchHistory()).toEqual(['aaa']);
  });
});
