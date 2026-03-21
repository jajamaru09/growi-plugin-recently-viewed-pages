import { describe, it, expect, beforeEach } from 'vitest';
import { renderPanel } from './sidebar-panel';
import { recordPageView, clearHistory, STORAGE_KEY } from './storage';

describe('sidebar-panel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no history', () => {
    const html = renderPanel();
    expect(html).toContain('閲覧履歴はありません');
    expect(html).toContain('閲覧履歴');
  });

  it('renders history items', () => {
    recordPageView('/test/page', 'page');
    const html = renderPanel();
    expect(html).toContain('page');
    expect(html).toContain('data-rv-href="/test/page"');
  });

  it('renders path hierarchy for nested pages', () => {
    recordPageView('/parent/child/page', 'page');
    const html = renderPanel();
    expect(html).toContain('parent');
    expect(html).toContain('child');
  });

  it('escapes HTML in titles to prevent XSS', () => {
    recordPageView('/test/<img onerror=alert(1)>', '<img onerror=alert(1)>');
    const html = renderPanel();
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('&lt;img onerror');
  });

  it('renders clear button', () => {
    const html = renderPanel();
    expect(html).toContain('grw-btn-clear-history');
    expect(html).toContain('delete_sweep');
  });
});
