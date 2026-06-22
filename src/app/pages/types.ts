import type { UserProfile } from '../lib/types';

export type PageName = 'home' | 'menu' | 'kitchen' | 'admin';

export type RoleRedirect = (
  user: UserProfile | null
) => PageName;

