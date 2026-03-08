import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  project_id: string;
  title: string; // Нужно для отображения в UI корзины
  price_per_share: number;
  shares_amount: number;
  available_shares: number; // Лимит, больше которого нельзя добавить
  image?: string | null; // Миниатюра проекта
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (project_id: string) => void;
  updateQuantity: (project_id: string, shares_amount: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItemsCount: () => number; // Количество уникальных проектов в корзине
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Добавление товара
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.project_id === item.project_id);

        if (existingItem) {
          // Если проект уже в корзине, увеличиваем количество, но не превышаем лимит
          const newQuantity = Math.min(
            existingItem.shares_amount + item.shares_amount,
            item.available_shares
          );

          set({
            items: currentItems.map((i) =>
              i.project_id === item.project_id
                ? { ...i, shares_amount: newQuantity }
                : i
            ),
          });
        } else {
          // Если проекта нет, просто добавляем новый объект
          set({ items: [...currentItems, item] });
        }
      },

      // Удаление конкретного товара
      removeItem: (project_id) => {
        set({
          items: get().items.filter((i) => i.project_id !== project_id),
        });
      },

      // Ручное обновление количества (например, через инпут в самой корзине)
      updateQuantity: (project_id, shares_amount) => {
        const currentItems = get().items;
        const itemToUpdate = currentItems.find((i) => i.project_id === project_id);
        
        if (!itemToUpdate) return;

        // Не даем уйти в минус или превысить доступное количество
        const validQuantity = Math.max(
          1,
          Math.min(shares_amount, itemToUpdate.available_shares)
        );

        set({
          items: currentItems.map((i) =>
            i.project_id === project_id
              ? { ...i, shares_amount: validQuantity }
              : i
          ),
        });
      },

      // Полная очистка (после успешной оплаты)
      clearCart: () => set({ items: [] }),

      // Подсчет итоговой суммы для Checkout
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price_per_share * item.shares_amount,
          0
        );
      },

      // Подсчет количества позиций (для красного бейджа на иконке корзины)
      getTotalItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "bimark-cart-storage", // Имя ключа в localStorage
    }
  )
);