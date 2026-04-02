import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  item_type: 'share' | 'asset'; // Теперь корзина знает, что именно в ней лежит
  item_id: string;              // Универсальный ID (вместо project_id)
  title: string;
  price: number;                // Универсальная цена (вместо price_per_share)
  quantity: number;             // Количество (вместо shares_amount)
  max_quantity: number;         // Лимит покупки (вместо available_shares)
  image?: string | null;
  is_unique?: boolean;          // Флаг для уникальных активов (их нельзя купить > 1)
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (item_id: string) => void;
  updateQuantity: (item_id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItemsCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Добавление товара
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (i) => i.item_id === item.item_id && i.item_type === item.item_type
        );

        if (existingItem) {
          // Если это уникальный актив, мы не можем добавить вторую штуку
          if (existingItem.is_unique) return;

          const newQuantity = Math.min(
            existingItem.quantity + item.quantity,
            item.max_quantity
          );

          set({
            items: currentItems.map((i) =>
              i.item_id === item.item_id && i.item_type === item.item_type
                ? { ...i, quantity: newQuantity }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },

      // Удаление конкретного товара
      removeItem: (item_id) => {
        set({
          items: get().items.filter((i) => i.item_id !== item_id),
        });
      },

      // Ручное обновление количества
      updateQuantity: (item_id, quantity) => {
        const currentItems = get().items;
        const itemToUpdate = currentItems.find((i) => i.item_id === item_id);
        
        if (!itemToUpdate) return;
        
        // Уникальный актив всегда = 1
        if (itemToUpdate.is_unique) return;

        const validQuantity = Math.max(
          1,
          Math.min(quantity, itemToUpdate.max_quantity)
        );

        set({
          items: currentItems.map((i) =>
            i.item_id === item_id
              ? { ...i, quantity: validQuantity }
              : i
          ),
        });
      },

      // Полная очистка
      clearCart: () => set({ items: [] }),

      // Подсчет итоговой суммы
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Подсчет количества позиций
      getTotalItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "bimark-cart-storage", // Важно: очисти LocalStorage в браузере, чтобы стереть старые "неправильные" товары!
    }
  )
);