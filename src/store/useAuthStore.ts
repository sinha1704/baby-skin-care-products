import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerUser {
  name: string;
  email: string;
}

interface AuthState {
  user: CustomerUser | null;
  token: string | null;
  login: (user: CustomerUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => {
        if (typeof window !== 'undefined') {
          document.cookie = `customer_session=${token}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'customer_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({ user: null, token: null });
      },
      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'baby-skin-care-customer-auth',
    }
  )
);
