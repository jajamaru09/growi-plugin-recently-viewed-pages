import { describe, it, expect } from 'vitest';
import { isExcludedPath, extractTitle } from './page-tracker';

describe('isExcludedPath', () => {
  it('excludes root path', () => {
    expect(isExcludedPath('/')).toBe(true);
  });

  it('excludes API paths', () => {
    expect(isExcludedPath('/_api/v3/pages')).toBe(true);
  });

  it('excludes search paths', () => {
    expect(isExcludedPath('/_search')).toBe(true);
  });

  it('excludes admin paths', () => {
    expect(isExcludedPath('/admin/plugins')).toBe(true);
  });

  it('excludes /me path', () => {
    expect(isExcludedPath('/me')).toBe(true);
    expect(isExcludedPath('/me/settings')).toBe(true);
  });

  it('excludes /trash path', () => {
    expect(isExcludedPath('/trash')).toBe(true);
  });

  it('allows normal page paths', () => {
    expect(isExcludedPath('/user/jun/メモ')).toBe(false);
    expect(isExcludedPath('/999_その他/Claudeコラム')).toBe(false);
  });
});

describe('extractTitle', () => {
  it('extracts last path segment', () => {
    expect(extractTitle('/999_その他/Claudeコラム/20260321_月齢')).toBe('20260321_月齢');
  });

  it('decodes URI-encoded segments', () => {
    expect(extractTitle('/test/%E3%83%86%E3%82%B9%E3%83%88')).toBe('テスト');
  });

  it('handles single-segment path', () => {
    expect(extractTitle('/テスト用')).toBe('テスト用');
  });
});
