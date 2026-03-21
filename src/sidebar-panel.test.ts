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
});
