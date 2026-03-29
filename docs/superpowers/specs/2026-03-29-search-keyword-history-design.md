# Search Keyword History Feature Design

## Overview

Add search keyword history to the recently viewed pages modal. Past search keywords are stored in localStorage and displayed as a dropdown when the search input is focused, allowing quick recall of previous searches.

## Storage

- **Key**: `growi-recently-viewed-search-history`
- **Format**: `string[]` (array of keyword strings)
- **Max items**: 10 (newest first, duplicates removed)
- **Save trigger**: When filtering actually narrows results (filtered count < total count) and query is non-empty/non-whitespace
- **Location**: `src/storage.ts` (new functions alongside existing page history functions)

### New Functions in `storage.ts`

- `getSearchHistory(): string[]` — Retrieve saved keywords
- `recordSearchKeyword(keyword: string): void` — Add keyword (deduplicate, enforce max 10)
- `removeSearchKeyword(keyword: string): void` — Remove a single keyword
- `clearSearchHistory(): void` — Remove all keywords (optional, for future use)

## UI: Dropdown

### Behavior

1. **Show**: When search input receives focus AND input is empty, display dropdown with saved keywords
2. **Hide**: When user starts typing, clicks outside the dropdown, or selects a keyword
3. **Click keyword**: Populate search input with that keyword, trigger filter, hide dropdown
4. **Click X button**: Remove that keyword from history, update dropdown in place
5. **Empty state**: If no saved keywords, do not show dropdown

### DOM Structure

```html
<div class="grw-rv-search-container">
  <input type="text" class="grw-rv-search-input" placeholder="ページを検索..." autocomplete="off">
  <div class="grw-rv-search-history-dropdown">
    <div class="grw-rv-search-history-item">
      <span class="grw-rv-search-history-keyword">keyword text</span>
      <button class="grw-rv-search-history-remove">✕</button>
    </div>
    <!-- ... more items ... -->
  </div>
</div>
```

### Styling

- Dropdown positioned absolute below the search input
- Full width of search container
- Each item: flex row with keyword left-aligned, X button right-aligned
- Hover highlight on items
- Respects dark mode via CSS variables (same approach as existing modal styles)
- Z-index above modal body content

## Save Logic

In `sidebar-panel.ts`, after filtering:

1. Check if `searchQuery.trim()` is non-empty
2. Check if `filteredHistory.length < history.length` (filtering actually narrowed results)
3. If both true, call `recordSearchKeyword(searchQuery.trim())`

## Code Changes

| File | Change |
|------|--------|
| `src/storage.ts` | Add `getSearchHistory`, `recordSearchKeyword`, `removeSearchKeyword`, `clearSearchHistory` |
| `src/sidebar-panel.ts` | Add dropdown rendering, focus/click/input events, save trigger logic |
| `src/styles.css` | Add dropdown and item styles |
| `src/storage.test.ts` | Tests for new storage functions |
| `src/sidebar-panel.test.ts` | Tests for dropdown show/hide, keyword selection, removal, save trigger |

## Edge Cases

- Keyword already exists in history: move to top (deduplicate)
- localStorage unavailable: silently fail (consistent with existing storage behavior)
- Very long keywords: no truncation in storage, CSS text-overflow in UI
- Modal close: dropdown should also close (handled by modal backdrop click)
