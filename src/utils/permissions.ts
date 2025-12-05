export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export const canManageWorkspace = (role?: Role) => ['owner', 'admin', 'editor'].includes(role || '');
export const canDeleteWorkspace = (role?: Role) => role === 'owner';
export const canManageMembers = (role?: Role) => ['owner', 'admin'].includes(role || '');
export const canEditContent = (role?: Role) => ['owner', 'admin', 'editor'].includes(role || '');
