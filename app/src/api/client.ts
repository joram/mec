import axios from "axios";

const BASE = "/api";

export const apiClient = axios.create({ baseURL: BASE });

apiClient.interceptors.request.use((config) => {
  const credentials = localStorage.getItem("credentials");
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`;
  }
  return config;
});

// ── Types ────────────────────────────────────────────────────────────────────

export interface ItemImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ItemSummary {
  id: string;
  product_code: string;
  name: string;
  categories: string[];
  price: number | null;
  primary_image_id: string | null;
}

export interface ItemDetail extends ItemSummary {
  description: string;
  tech_specs: Record<string, string[]>;
  img_urls: Record<string, string[]>;
  source_url: string | null;
  images: ItemImage[];
}

export interface ItemsPage {
  items: ItemSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface CartItemOut {
  id: string;
  item_id: string;
  quantity: number;
  item: ItemSummary;
}

export interface CartOut {
  items: CartItemOut[];
  total_items: number;
}

// ── Items API ─────────────────────────────────────────────────────────────────

export const itemsApi = {
  list: (page = 1, pageSize = 24, category?: string) =>
    apiClient
      .get<ItemsPage>("/items", { params: { page, page_size: pageSize, category } })
      .then((r) => r.data),

  search: (q: string, page = 1, pageSize = 24) =>
    apiClient
      .get<ItemsPage>("/items/search", { params: { q, page, page_size: pageSize } })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<ItemDetail>(`/items/${id}`).then((r) => r.data),

  categories: () =>
    apiClient.get<string[]>("/items/categories").then((r) => r.data),

  imageUrl: (itemId: string, imageId: string) =>
    `${BASE}/items/${itemId}/images/${imageId}`,
};

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (username: string, email: string, password: string) =>
    apiClient
      .post<User>("/auth/register", { username, email, password })
      .then((r) => r.data),

  /**
   * Encode credentials, store them, then verify against /auth/me.
   * If the server rejects them the stored credentials are cleared.
   */
  login: async (username: string, password: string): Promise<User> => {
    const encoded = btoa(`${username}:${password}`);
    localStorage.setItem("credentials", encoded);
    try {
      const user = await axios
        .get<User>(`${BASE}/auth/me`, {
          headers: { Authorization: `Basic ${encoded}` },
        })
        .then((r) => r.data);
      return user;
    } catch (e) {
      localStorage.removeItem("credentials");
      throw e;
    }
  },

  logout: () => localStorage.removeItem("credentials"),

  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),
};

// ── Cart API ──────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => apiClient.get<CartOut>("/cart").then((r) => r.data),

  add: (itemId: string, quantity = 1) =>
    apiClient.post<CartItemOut>("/cart", { item_id: itemId, quantity }).then((r) => r.data),

  update: (cartItemId: string, quantity: number) =>
    apiClient
      .patch<CartItemOut>(`/cart/${cartItemId}`, { quantity })
      .then((r) => r.data),

  remove: (cartItemId: string) => apiClient.delete(`/cart/${cartItemId}`),

  clear: () => apiClient.delete("/cart"),
};
