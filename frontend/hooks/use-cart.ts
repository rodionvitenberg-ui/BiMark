import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  item_type: 'share' | 'asset';
  item_id: string;
  title: string;
  price: number;
  quantity: number;
  max_quantity: number;
  image?: string | null;
  is_unique?: boolean;
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
      // Гарантируем, что state.items всегда массив
      items: [],

      // Добавление товара
      addItem: (item) => {
        if (!item || !item.item_id) return; // Защита от пустых объектов

        const currentItems = get().items || [];
        const existingItem = currentItems.find(
          (i) => i?.item_id === item.item_id && i?.item_type === item.item_type
        );

        if (existingItem) {
          if (existingItem.is_unique) return;

          // Жестко приводим к числам, чтобы избежать сложения строк или NaN
          const newQuantity = Math.min(
            (Number(existingItem.quantity) || 0) + (Number(item.quantity) || 1),
            Number(existingItem.max_quantity) || 1
          );

          set({
            items: currentItems.map((i) =>
              i.item_id === item.item_id && i.item_type === item.item_type
                ? { ...i, quantity: newQuantity }
                : i
            ),
          });
        } else {
          // Очищаем данные перед добавлением нового товара
          const cleanItem = {
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            max_quantity: Number(item.max_quantity) || 1,
          };
          set({ items: [...currentItems, cleanItem] });
        }
      },

      // Удаление конкретного товара
      removeItem: (item_id) => {
        if (!item_id) return;
        set({
          // Фильтруем совпадение + заодно вычищаем "битые" товары без id
          items: (get().items || []).filter((i) => i && i.item_id && i.item_id !== item_id),
        });
      },

      // Ручное обновление количества
      updateQuantity: (item_id, quantity) => {
        const currentItems = get().items || [];
        const itemToUpdate = currentItems.find((i) => i?.item_id === item_id);
        
        if (!itemToUpdate) return;
        if (itemToUpdate.is_unique) return;

        const validQuantity = Math.max(
          1,
          Math.min(Number(quantity) || 1, Number(itemToUpdate.max_quantity) || 1)
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
        return (get().items || []).reduce((total, item) => {
          if (!item) return total; // Пропускаем undefined
          
          // Железобетонная защита от NaN
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          
          return total + (price * quantity);
        }, 0);
      },

      // Подсчет количества позиций
      getTotalItemsCount: () => {
        // Считаем только валидные товары с существующим id
        return (get().items || []).filter(i => i && i.item_id).length;
      },
    }),
    {
      name: "bimark-cart", // Название ключа в localStorage
    }
  )
);