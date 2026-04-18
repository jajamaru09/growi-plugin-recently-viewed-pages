export interface GrowiPageContext {
  pageId: string;
  mode: 'view' | 'edit';
  revisionId?: string;
  path?: string;
}

export interface PluginRegistration {
  id: string;
  label: string;
  icon?: string;
  order?: number;
  required?: boolean;
  menuItem?: boolean;
  onAction?: (pageId: string) => void;
  onPageChange?: (ctx: GrowiPageContext) => void;
  onDisable?: () => void;
  badge?: number | null;
  badgeColor?: string;
}

export interface GrowiPluginHub {
  register(plugin: PluginRegistration): void;
  unregister(id: string): void;
  updateBadge(id: string, value: number | null): void;
  api: {
    fetchPageIdByPath(path: string, signal?: AbortSignal): Promise<string | null>;
    fetchPageInfo(pageId: string, signal?: AbortSignal): Promise<{ path?: string; title?: string } | null>;
    fetchRevisions(pageId: string, signal?: AbortSignal): Promise<unknown[]>;
    fetchRevision(revisionId: string, signal?: AbortSignal): Promise<unknown | null>;
    fetchAttachments(pageId: string, signal?: AbortSignal): Promise<unknown[]>;
    fetchAttachment(attachmentId: string, signal?: AbortSignal): Promise<unknown | null>;
    fetchUsers(userIds: string[], signal?: AbortSignal): Promise<unknown[]>;
    searchPages(keyword: string, signal?: AbortSignal): Promise<unknown[]>;
    sanitizePageId(id: string): string;
    extractPageId(pathname: string): string | null;
    isExcludedPath(pathname: string): boolean;
  };
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (data: unknown) => void): () => void;
  log(pluginId: string, ...args: unknown[]): void;
  debug: boolean;
  _queue?: PluginRegistration[];
}
