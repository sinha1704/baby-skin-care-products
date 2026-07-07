import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => {
        // Mock admin cookie session for cross-origin or port sharing standard if needed
        if (typeof window !== 'undefined') {
          document.cookie = `admin_session=${token}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({ user: null, token: null });
      },
      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'baby-skin-care-admin-auth',
    }
  )
);
