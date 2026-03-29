import { describe, it, expect, beforeEach } from 'vitest';
import { renderBody } from './sidebar-panel';
import { recordPageView, clearHistory, STORAGE_KEY } from './storage';

describe('sidebar-panel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no history', () => {
    const html = renderBody();
    expect(html).toContain('閲覧履歴はありません');
  });

  it('renders history items', () => {
    recordPageView('/test/page', 'page');
    const html = renderBody();
    expect(html).toContain('page');
    expect(html).toContain('data-rv-href="/test/page"');
  });

  it('renders path hierarchy for nested pages', () => {
    recordPageView('/parent/child/page', 'page');
    const html = renderBody();
    expect(html).toContain('parent');
    expect(html).toContain('child');
  });

  it('escapes HTML in titles to prevent XSS', () => {
    recordPageView('/test/<img onerror=alert(1)>', '<img onerror=alert(1)>');
    const html = renderBody();
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('&lt;img onerror');
  });

  describe('search filtering', () => {
    beforeEach(() => {
      // Set up test data
      recordPageView('/react/components', 'React Component');
      recordPageView('/vue/components', 'Vue Component');
      recordPageView('/docs/api', 'API Documentation');
    });

    it('returns all items when search query is empty', () => {
      const html = renderBody('');
      expect(html).toContain('React Component');
      expect(html).toContain('Vue Component');
      expect(html).toContain('API Documentation');
    });

    it('filters items by title', () => {
      const html = renderBody('react');
      expect(html).toContain('React Component');
      expect(html).not.toContain('Vue Component');
      expect(html).not.toContain('API Documentation');
    });

    it('filters items by path', () => {
      const html = renderBody('docs');
      expect(html).not.toContain('React Component');
      expect(html).not.toContain('Vue Component');
      expect(html).toContain('API Documentation');
    });

    it('is case insensitive', () => {
      const html = renderBody('REACT');
      expect(html).toContain('React Component');
    });

    it('shows no results message when no items match', () => {
      const html = renderBody('nonexistent');
      expect(html).toContain('該当する履歴が見つかりません');
      expect(html).not.toContain('React Component');
    });

    it('trims whitespace from search query', () => {
      const html = renderBody('  react  ');
      expect(html).toContain('React Component');
    });

    it('matches partial words in title and path', () => {
      const html = renderBody('comp');
      expect(html).toContain('React Component');
      expect(html).toContain('Vue Component');
      expect(html).not.toContain('API Documentation');
    });
  });
});
