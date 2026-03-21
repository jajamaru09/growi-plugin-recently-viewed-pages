import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './relative-time';

describe('formatRelativeTime', () => {
  const now = Date.now();

  it('returns "just now" for < 60 seconds ago', () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe('just now');
  });

  it('returns "1 minute" for 60-119 seconds ago', () => {
    expect(formatRelativeTime(now - 90_000, now)).toBe('1 minute');
  });

  it('returns "N minutes" for 2-59 minutes ago', () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5 minutes');
  });

  it('returns "1 hour" for 60-119 minutes ago', () => {
    expect(formatRelativeTime(now - 90 * 60_000, now)).toBe('1 hour');
  });

  it('returns "N hours" for 2-23 hours ago', () => {
    expect(formatRelativeTime(now - 5 * 3600_000, now)).toBe('5 hours');
  });

  it('returns "1 day" for 24-47 hours ago', () => {
    expect(formatRelativeTime(now - 30 * 3600_000, now)).toBe('1 day');
  });

  it('returns "N days" for 2-29 days ago', () => {
    expect(formatRelativeTime(now - 5 * 86400_000, now)).toBe('5 days');
  });

  it('returns formatted date for >= 30 days ago', () => {
    const old = new Date(2026, 0, 15, 14, 30).getTime();
    expect(formatRelativeTime(old, now)).toBe('2026/01/15 14:30');
  });
});
