import { create } from "zustand";
import { cartApi, CartOut, CartItemOut } from "../api/client";

interface CartState {
  cart: CartOut | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (itemId: string, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await cartApi.get();
      set({ cart, loading: false });
    } catch {
      set({ loading: false, cart: null });
    }
  },

  addItem: async (itemId, quantity = 1) => {
    const result = await cartApi.add(itemId, quantity);
    const current = get().cart;
    if (!current) {
      set({ cart: { items: [result], total_items: result.quantity } });
      return;
    }
    const idx = current.items.findIndex((i) => i.item_id === itemId);
    let items: CartItemOut[];
    if (idx >= 0) {
      items = current.items.map((i, j) => (j === idx ? result : i));
    } else {
      items = [...current.items, result];
    }
    set({ cart: { items, total_items: items.reduce((s, i) => s + i.quantity, 0) } });
  },

  updateItem: async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(cartItemId);
      return;
    }
    const result = await cartApi.update(cartItemId, quantity);
    const current = get().cart;
    if (!current) return;
    const items = current.items.map((i) => (i.id === cartItemId ? result : i));
    set({ cart: { items, total_items: items.reduce((s, i) => s + i.quantity, 0) } });
  },

  removeItem: async (cartItemId) => {
    await cartApi.remove(cartItemId);
    const current = get().cart;
    if (!current) return;
    const items = current.items.filter((i) => i.id !== cartItemId);
    set({ cart: { items, total_items: items.reduce((s, i) => s + i.quantity, 0) } });
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: { items: [], total_items: 0 } });
  },
}));
