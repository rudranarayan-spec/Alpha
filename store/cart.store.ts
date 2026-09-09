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
  dueAmount: number; // New
  setDueAmount: (amount: number) => void; // New

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (product: Product, delta: number) => void;
  clearCart: () => void;
  setQuantity: (product: Product, quantity: number) => void;

  // Computed Values (Getters)
  getCartItems: () => CartItem[];
  getItemQuantity: (productId: number) => number;
  getTotalItemsCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      dueAmount: 0,
      setDueAmount: (amount) => set({ dueAmount: amount }),
      items: {},

      addItem: (product, quantity = 1) => {
        if (get().dueAmount > 0) {
          return;
        }
        set((state) => {
          const existing = state.items[product.id];
          const currentQty = existing?.quantity ?? 0;
          const nextQty = currentQty + quantity;

          if (nextQty > product.stock) {
            return state;
          }

          return {
            items: {
              ...state.items,
              [product.id]: { product, quantity: nextQty },
            },
          };
        });
      },

      setQuantity: (product, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const copy = { ...state.items };
            delete copy[product.id];
            return { items: copy };
          }

          if (quantity > product.stock) {
            return state; // or handle validation error
          }

          return {
            items: {
              ...state.items,
              [product.id]: { product, quantity },
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
        if (delta > 0 && get().dueAmount > 0) {
          return;
        }
        set((state) => {
          const currentQty = state.items[product.id]?.quantity ?? 0;
          const nextQty = currentQty + delta;
          if (nextQty <= 0) {
            const copy = { ...state.items };
            delete copy[product.id];
            return { items: copy };
          }

          if (delta > 0 && nextQty > product.stock) {
            return state;
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
