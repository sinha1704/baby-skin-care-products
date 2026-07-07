import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../data/seed';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          const newQty = Math.min(product.stock, existingItem.quantity + quantity);
          set({
            items: currentItems.map((item) =>
              item.id === product.id ? { ...item, quantity: newQty } : item
            ),
          });
        } else {
          const addQty = Math.min(product.stock, quantity);
          if (addQty > 0) {
            set({
              items: [
                ...currentItems,
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: addQty,
                  image: product.images[0] || '',
                  stock: product.stock,
                },
              ],
            });
          }
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === productId);
        if (!item) return;

        const validatedQty = Math.max(1, Math.min(item.stock, quantity));
        set({
          items: currentItems.map((i) =>
            i.id === productId ? { ...i, quantity: validatedQty } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'baby-skin-care-cart',
    }
  )
);
