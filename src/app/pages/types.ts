import type { UserProfile } from '../utils/mockDb';

export type PageName = 'home' | 'menu' | 'kitchen' | 'admin';

export type RoleRedirect = (
  user: UserProfile | null
) => PageName;

