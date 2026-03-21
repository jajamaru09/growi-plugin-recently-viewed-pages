# Growi Plugin: Recently Viewed Pages — Design Spec

## Overview

A Growi script plugin that tracks pages the user visits using localStorage and displays them in a dedicated sidebar panel, mimicking Growi's native sidebar UI (e.g., "Recent Changes", "Notifications").

## Plugin Type & Registration

- **Type**: Script plugin (`growiPlugin.types: ["script"]`)
- **Schema**: v4
- **Entry**: `client-entry.tsx`
- **Build**: Vite + TypeScript (no React dependency — pure DOM manipulation)

## Architecture

### Approach: DOM Injection via MutationObserver

The plugin injects a sidebar nav button and a content panel directly into Growi's existing sidebar DOM structure. It uses Growi's own CSS classes for visual consistency.

### Components

#### 1. Sidebar Nav Button

- **Location**: After the `#in-app-notification` button in `.grw-sidebar-nav-primary-container .PrimaryItems_grw-primary-items__MP17f`
- **Icon**: `history` (Material Symbols Outlined — already loaded by Growi)
- **ID**: `recently-viewed`
- **Behavior**: Click toggles the content panel, sets `active` class on this button and removes it from others
- **HTML structure** (matches existing buttons exactly):
  ```html
  <button type="button" class="btn btn-primary m-1 rounded" id="recently-viewed">
    <div class="position-relative">
      <span class="material-symbols-outlined">history</span>
    </div>
  </button>
  ```

#### 2. Content Panel

- **Location**: Replaces content inside `.grw-sidebar-contents` when the button is active
- **Header**: "閲覧履歴" title + clear-all button (trash icon)
- **List**: Uses `list-group list-group-flush` matching the "Recent Changes" list structure
- **Each item shows**:
  - Page path hierarchy (parent segments as links, separated by `/`)
  - Page title (last segment, as a clickable link)
  - Relative time since last view (e.g., "3 minutes", "2 hours", "1 day")
- **Empty state**: "閲覧履歴はありません" message

#### 3. localStorage Data Store

- **Key**: `growi-recently-viewed-pages`
- **Schema**:
  ```typescript
  type ViewedPage = {
    path: string;      // e.g., "/999_その他/Claudeコラム/20260321_月齢"
    title: string;     // last segment decoded, e.g., "20260321_月齢"
    viewedAt: number;  // Unix timestamp in ms
  };
  // Stored as JSON array, max 30 items, sorted by viewedAt descending
  ```
- **Operations**:
  - `recordPageView(path, title)`: Add or update entry, enforce 30-item limit
  - `getHistory()`: Return sorted array
  - `clearHistory()`: Remove all entries

#### 4. Page View Detection

- **On activate**: Record current `window.location.pathname`
- **SPA navigation**: Listen to `popstate` event + periodic URL polling (setInterval 1s) to catch `pushState` navigations that Growi's Next.js router uses
- **Title extraction**: `document.title` or decode the last path segment
- **Excluded paths**: `/` (root only if path is exactly `/`), paths starting with `/_api/`, `/_search`, `/admin`, `/me`, `/trash`

#### 5. Relative Time Formatting

Lightweight self-contained function (no external dependency):
- < 1 min: "just now"
- < 60 min: "N minutes"
- < 24 hours: "N hours"
- < 30 days: "N days"
- Otherwise: `YYYY/MM/DD HH:mm` (matching Growi's fallback format)

### Sidebar Integration Logic

1. `activate()` is called by Growi
2. Use `MutationObserver` on `document.body` to wait for `.grw-sidebar-nav-primary-container` to appear
3. Inject the nav button after `#in-app-notification`
4. On button click:
   - Remove `active` class from all sibling nav buttons
   - Add `active` to this button
   - Replace `.grw-sidebar-contents` innerHTML with the history panel
5. On any other nav button click (via event delegation):
   - Remove `active` from our button
   - Let Growi's native handler show its panel
6. Start page-view tracking (URL monitoring)

### Interaction with Existing Sidebar

- The plugin listens for clicks on existing sidebar nav buttons to deactivate its own panel
- When another panel is active and user navigates, the plugin still records the visit silently
- The plugin does NOT interfere with Growi's `growiFacade.markdownRenderer` — it operates entirely on sidebar DOM

## File Structure

```
growi-plugin-recently-viewed-pages/
├── client-entry.tsx           # Plugin activate/deactivate + registration
├── src/
│   ├── sidebar-button.ts     # Inject nav button, handle active state
│   ├── sidebar-panel.ts      # Render history list panel
│   ├── storage.ts            # localStorage CRUD (record, get, clear)
│   ├── page-tracker.ts       # URL monitoring + page view detection
│   ├── relative-time.ts      # Time formatting utility
│   └── styles.css            # Minimal custom styles (if needed)
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── index.html                # Dev mock page
└── .gitignore
```

## Edge Cases

- **localStorage unavailable**: Gracefully degrade — button still renders, panel shows error message
- **Growi DOM changes**: If expected selectors aren't found, plugin does nothing (no errors thrown)
- **Multiple tabs**: Each tab writes to the same localStorage; history reflects all tabs
- **Page title with special characters**: Titles are stored decoded (using `decodeURIComponent`)
- **Same page revisited**: Updates `viewedAt` timestamp, moves to top of list

## Testing Strategy

- Manual testing in Growi 7.4.x
- Dev mock page (`index.html`) with simulated sidebar DOM for local development
- Unit tests for `storage.ts` and `relative-time.ts` (vitest)
