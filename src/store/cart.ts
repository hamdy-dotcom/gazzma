import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, size: string) => void
  removeItem: (productId: string, size: string) => void
  updateQty: (productId: string, size: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size) => {
        const items = get().items
        const existing = items.find(
          (i) => i.product.id === product.id && i.size === size
        )
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id && i.size === size
                ? { ...i, qty: i.qty + 1 }
                : i
            ),
            isOpen: true,
          })
        } else {
          set({ items: [...items, { product, size, qty: 1 }], isOpen: true })
        }
      },

      removeItem: (productId, size) =>
        set({
          items: get().items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        }),

      updateQty: (productId, size, qty) => {
        if (qty < 1) {
          get().removeItem(productId, size)
          return
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId && i.size === size ? { ...i, qty } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.outlet_price_egp * i.qty,
          0
        ),

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'sole-outlet-cart' }
  )
)
