import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartItem, Product } from './types';
import { effectivePrice } from './utils';
import { priceCart } from './api';

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** Sum of per-line sale prices (product discounts already reflected). */
  subtotal: number;
  /** Backend-computed cart-discount amount (cents), or 0 when none / still pricing. */
  cartDiscount: number;
  /** Amount due after cart discounts: subtotal − cartDiscount. */
  total: number;
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
  const [cartDiscount, setCartDiscount] = useState(0);

  // A signature of the cart contents; re-price on the backend whenever it changes (debounced).
  const sig = items.map((i) => `${i.product.sku}x${i.qty}`).join(',');
  const reqId = useRef(0);
  useEffect(() => {
    if (items.length === 0) {
      setCartDiscount(0);
      return;
    }
    const id = ++reqId.current;
    const lineItems = items.map((i) => ({ sku: i.product.sku, quantity: i.qty }));
    const t = setTimeout(() => {
      priceCart(lineItems).then((p) => {
        // Ignore stale responses (cart changed again before this resolved).
        if (id === reqId.current) setCartDiscount(p.cartDiscountCent);
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * effectivePrice(i.product), 0);
    const discount = Math.min(cartDiscount, subtotal);
    return {
      items,
      count,
      subtotal,
      cartDiscount: discount,
      total: subtotal - discount,
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
  }, [items, isOpen, cartDiscount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
