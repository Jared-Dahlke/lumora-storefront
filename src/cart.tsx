import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from './types';
import { effectivePrice } from './utils';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * effectivePrice(i.product), 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      add: (p) =>
        setItems((cur) => {
          const found = cur.find((i) => i.product.id === p.id);
          if (found) return cur.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
          return [...cur, { product: p, qty: 1 }];
        }),
      setQty: (id, qty) =>
        setItems((cur) =>
          qty <= 0
            ? cur.filter((i) => i.product.id !== id)
            : cur.map((i) => (i.product.id === id ? { ...i, qty } : i)),
        ),
      remove: (id) => setItems((cur) => cur.filter((i) => i.product.id !== id)),
      clear: () => setItems([]),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
