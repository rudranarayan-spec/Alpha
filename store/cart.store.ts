import { Product } from "@/types/category.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: Record<number, CartItem>; // Keyed by productId for O(1) lookups

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (product: Product, delta: number) => void;
  clearCart: () => void;

  // Computed Values (Getters)
  getCartItems: () => CartItem[];
  getItemQuantity: (productId: number) => number;
  getTotalItemsCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items[product.id];
          const newQty = (existing?.quantity ?? 0) + quantity;

          return {
            items: {
              ...state.items,
              [product.id]: { product, quantity: newQty },
            },
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const copy = { ...state.items };
          delete copy[productId];
          return { items: copy };
        });
      },

      updateQuantity: (product, delta) => {
        set((state) => {
          const currentQty = state.items[product.id]?.quantity ?? 0;
          const nextQty = currentQty + delta;

          if (nextQty <= 0) {
            const copy = { ...state.items };
            delete copy[product.id];
            return { items: copy };
          }

          return {
            items: {
              ...state.items,
              [product.id]: { product, quantity: nextQty },
            },
          };
        });
      },

      clearCart: () => set({ items: {} }),

      getCartItems: () => Object.values(get().items),

      getItemQuantity: (productId) => get().items[productId]?.quantity ?? 0,

      getTotalItemsCount: () =>
        Object.values(get().items).reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),

      getSubtotal: () =>
        Object.values(get().items).reduce((sum, item) => {
          const price = parseFloat(
            item.product.selling_price ?? item.product.mrp ?? "0",
          );
          return sum + (isNaN(price) ? 0 : price) * item.quantity;
        }, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
