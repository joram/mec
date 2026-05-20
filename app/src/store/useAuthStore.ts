import { create } from "zustand";
import { authApi, User } from "../api/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const user = await authApi.login(username, password);
      set({ user, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      await authApi.register(username, email, password);
      const user = await authApi.login(username, password);
      set({ user, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: () => {
    authApi.logout();
    set({ user: null });
  },

  fetchMe: async () => {
    if (!localStorage.getItem("credentials")) return;
    try {
      const user = await authApi.me();
      set({ user });
    } catch {
      localStorage.removeItem("credentials");
    }
  },
}));
