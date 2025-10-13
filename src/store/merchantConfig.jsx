// ✅ src/store/merchantConfig.jsx
import { create } from "zustand";

export const useMerchantConfig = create((set) => ({
  // 🧾 Menu items (foods)
  menuItems: [],
  setMenuItems: (items) => set({ menuItems: items }),

  // 🍱 Portion categories (like small, medium, large)
  portions: [],
  setPortions: (items) => set({ portions: items }),

  // 🏪 Optional store-level data (future use)
  merchantSettings: {},
  setMerchantSettings: (data) => set({ merchantSettings: data }),
}));
