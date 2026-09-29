import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("kedai-nongkrong-cart");
    if (!saved) return;

    try {
      setItems(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem("kedai-nongkrong-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("kedai-nongkrong-cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) return prev.map((i) => i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) setItems((prev) => prev.filter((i) => i.product._id !== productId));
    else setItems((prev) => prev.map((i) => i.product._id === productId ? { ...i, qty } : i));
  }, []);

  const updateNote = useCallback((productId: string, note: string) => {
    setItems((prev) => prev.map((i) => i.product._id === productId ? { ...i, note } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, totalQty, subtotal, addItem, removeItem, updateQty, updateNote, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
