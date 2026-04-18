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

  it('filters history by keyword matching title', () => {
    recordPageView('/a/react-hooks', 'React Hooks入門');
    recordPageView('/b/typescript', 'TypeScript基礎');
    recordPageView('/c/api', 'API設計');
    const html = renderBody('react');
    expect(html).toContain('React Hooks');
    expect(html).not.toContain('TypeScript');
    expect(html).not.toContain('API設計');
  });

  it('filters history by keyword matching path', () => {
    recordPageView('/docs/react/hooks', 'Hooks');
    recordPageView('/docs/vue/basics', 'Basics');
    const html = renderBody('react');
    expect(html).toContain('Hooks');
    expect(html).not.toContain('Basics');
  });

  it('filter is case-insensitive', () => {
    recordPageView('/test/page', 'React Hooks');
    const html = renderBody('REACT');
    expect(html).toContain('React Hooks');
  });

  it('shows empty message when filter matches nothing', () => {
    recordPageView('/test/page', 'React');
    const html = renderBody('xxxxxxx');
    expect(html).toContain('該当する履歴はありません');
  });

  it('shows all items when filter is empty string', () => {
    recordPageView('/a', 'AAA');
    recordPageView('/b', 'BBB');
    const html = renderBody('');
    expect(html).toContain('AAA');
    expect(html).toContain('BBB');
  });
});
