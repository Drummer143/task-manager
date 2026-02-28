export const queryKeys = {
  profile: {
    root: () => ["profile"] as const
  },

  workspaces: {
    root: () => ["workspaces"] as const,
    detail: (workspaceId: string) => ["workspace", workspaceId] as const,
    owner: (workspaceId: string) => ["workspace", "owner", workspaceId] as const
  },

  workspaceAccess: {
    byWorkspace: (workspaceId: string) => ["access", workspaceId] as const
  },

  pages: {
    root: () => ["pages"] as const,
    tree: (workspaceId: string) => ["pages", "tree", workspaceId] as const,
    detail: (pageId: string) => [pageId] as const
  },

  pageAccess: {
    root: () => ["pageAccesses"] as const
  },

  tasks: {
    detail: (taskId: string) => [taskId] as const
  },

  boardStatuses: {
    byPage: (pageId: string) => ["statuses", pageId] as const
  },

  users: {
    root: () => ["users"] as const,
    byWorkspace: (workspaceId: string) => ["users", workspaceId] as const
  }
};
