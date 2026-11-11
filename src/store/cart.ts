'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartProduct = { variantId: string; productId: string; name: string; sku: string; price: number; image: string; size?: string | null; quantity: number };
type CartState = { items: CartProduct[]; isOpen: boolean; add: (item: Omit<CartProduct, 'quantity'>) => void; remove: (variantId: string) => void; setQuantity: (variantId: string, quantity: number) => void; clear: () => void; open: () => void; close: () => void };

export const useCart = create<CartState>()(persist((set) => ({
  items: [],
  isOpen: false,
  add: (item) => set((state) => {
    const existing = state.items.find((x) => x.variantId === item.variantId);
    return { items: existing ? state.items.map((x) => x.variantId === item.variantId ? { ...x, quantity: Math.min(x.quantity + 1, 20) } : x) : [...state.items, { ...item, quantity: 1 }], isOpen: true };
  }),
  remove: (variantId) => set((state) => ({ items: state.items.filter((x) => x.variantId !== variantId) })),
  setQuantity: (variantId, quantity) => set((state) => ({ items: state.items.map((x) => x.variantId === variantId ? { ...x, quantity: Math.max(1, Math.min(quantity, 20)) } : x) })),
  clear: () => set({ items: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}), { name: 'maison-cart', partialize: (state) => ({ items: state.items }) }));
