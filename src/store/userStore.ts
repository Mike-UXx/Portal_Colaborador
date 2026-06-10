import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { MOCK_USERS, CURRENT_USER_ID } from '../mocks/data';

interface UserState {
  /** The underlying account (identity used for acceptance evidence). */
  currentUser: User | null;
  /** Name typed at login. null = the user skipped ("Pular / Ignorar"). */
  displayName: string | null;
  /** Whether the user has passed the login screen. */
  loginComplete: boolean;
  /** Ids of Home banners (welcome / announcements) the user has dismissed. Persisted. */
  dismissedBanners: string[];

  login: (userId: string) => void;
  /** Finish login. Pass a name to personalize the greeting, or null/empty to skip. */
  completeLogin: (name?: string | null) => void;
  /** Permanently dismiss a Home banner by id (does not reappear, even after logout). */
  dismissBanner: (id: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      displayName: null,
      loginComplete: false,
      dismissedBanners: [],

      login: (userId) => {
        const user = MOCK_USERS.find(u => u.id === userId) ?? MOCK_USERS[0];
        set({ currentUser: user });
      },

      completeLogin: (name = null) => {
        const trimmed = name && name.trim() ? name.trim() : null;
        set({ displayName: trimmed, loginComplete: true });
      },

      dismissBanner: (id) =>
        set(state => (state.dismissedBanners.includes(id) ? {} : { dismissedBanners: [...state.dismissedBanners, id] })),

      // Note: dismissedBanners is intentionally NOT cleared — a dismissed welcome/announcement
      // stays dismissed across logout/login ("nunca após fechar").
      reset: () => set({ currentUser: null, displayName: null, loginComplete: false }),
    }),
    { name: 'portal-user-store' }
  )
);

// Auto-login the underlying mock account for demo purposes (identity only).
export function ensureLoggedIn() {
  const { currentUser, login } = useUserStore.getState();
  if (!currentUser) {
    login(CURRENT_USER_ID);
  }
}

/** Initials from a name (max 2 letters). */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}
