import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  salePrice: number;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = "fbd_cart";

export function CartProvider({ children }: React.PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((raw) => {
      if (raw) {
        try { setItems(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  function save(next: CartItem[]) {
    setItems(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
  }

  function addItem(item: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      } else {
        next = [...prev, { ...item, quantity: 1 }];
      }
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeItem(productId: number) {
    save(items.filter((i) => i.productId !== productId));
  }

  function updateQty(productId: number, quantity: number) {
    if (quantity <= 0) { removeItem(productId); return; }
    save(items.map((i) => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i));
  }

  function clearCart() { save([]); }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
