import type { GrowiPageContext, PluginRegistration, GrowiPluginHub } from './src/types';
import { recordPageView } from './src/storage';
import { openModal, closeModal, removeModal } from './src/sidebar-panel';
import { ensureSidebarButton, removeSidebarButton } from './src/sidebar-button';
import { PLUGIN_NAME, log } from './src/logger';

/** Reactの再レンダリング完了を待つための遅延 (ms) */
const REACT_RENDER_DELAY_MS = 500;
/** document.title の更新を待つための遅延 (ms) */
const TITLE_UPDATE_DELAY_MS = 300;

function registerToHub(plugin: PluginRegistration): void {
  const hub = window.growiPluginHub;
  if (hub?.register) {
    hub.register(plugin);
  } else {
    window.growiPluginHub ??= { _queue: [] };
    window.growiPluginHub._queue!.push(plugin);
  }
}

function getHub(): GrowiPluginHub | null {
  const hub = window.growiPluginHub;
  return hub?.register ? (hub as GrowiPluginHub) : null;
}

/** document.title からページタイトルを抽出（サイト名サフィックスを除去） */
function getPageTitle(): string {
  const docTitle = document.title;
  if (docTitle) {
    const sepDash = docTitle.lastIndexOf(' - ');
    const sepPipe = docTitle.lastIndexOf(' | ');
    const sepPos = Math.max(sepDash, sepPipe);
    if (sepPos > 0) {
      const cleaned = docTitle.substring(0, sepPos).trim();
      if (cleaned && !/^[0-9a-f]{24}$/i.test(cleaned)) return cleaned;
    }
  }
  const segments = window.location.pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  try { return decodeURIComponent(last); } catch { return last; }
}

/** hub の onPageChange コールバック: wiki パスを解決してストレージに記録 */
async function handlePageChange(ctx: GrowiPageContext): Promise<void> {
  const hub = getHub();
  log('onPageChange:', ctx.pageId, ctx.mode);

  // Reactの再レンダリング完了を待ってからボタンを配置
  setTimeout(() => ensureSidebarButton(() => openModal()), REACT_RENDER_DELAY_MS);

  if (ctx.mode === 'edit') return;

  // パス解決: ctx.path があればそれを使用、なければ API で取得
  let wikiPath = ctx.path ?? null;
  if (!wikiPath && hub) {
    try {
      const info = await hub.api.fetchPageInfo(ctx.pageId);
      wikiPath = info?.path ?? null;
    } catch {
      // API 失敗時はフォールバック
    }
  }
  if (!wikiPath) {
    wikiPath = window.location.pathname;
  }

  // タイトル取得（少し待って document.title が更新されるのを待つ）
  await new Promise(r => setTimeout(r, TITLE_UPDATE_DELAY_MS));
  const title = getPageTitle();

  recordPageView(wikiPath, title);
  log('recorded:', wikiPath, title);
}

function activate(): void {
  // 初回のボタン配置（hub の onPageChange 初回発火より前に確保）
  ensureSidebarButton(() => openModal());

  registerToHub({
    id: PLUGIN_NAME,
    label: '閲覧履歴',
    icon: 'history',
    order: 20,
    menuItem: false,
    onPageChange: (ctx: GrowiPageContext) => {
      handlePageChange(ctx);
    },
    onDisable: () => {
      closeModal();
      removeModal();
      removeSidebarButton();
    },
  });
}

function deactivate(): void {
  closeModal();
  removeModal();
  removeSidebarButton();
  window.growiPluginHub?.unregister?.(PLUGIN_NAME);
}

window.pluginActivators ??= {};
window.pluginActivators[PLUGIN_NAME] = { activate, deactivate };

export {};
