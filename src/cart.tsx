import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartItem, Product } from './types';
import { effectivePrice } from './utils';
import { priceCart, type CouponState } from './api';

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** Sum of per-line sale prices (product discounts already reflected). */
  subtotal: number;
  /** Backend-computed discount amount (cents): cart discount and/or applied coupon. */
  cartDiscount: number;
  /** Amount due after discounts: subtotal − cartDiscount. */
  total: number;
  /** The coupon code currently submitted (may be applied or invalid). */
  coupon: string;
  couponState: CouponState;
  couponReason?: string;
  /** True while the cart is being (re)priced on the backend. */
  pricing: boolean;
  isOpen: boolean;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState<CouponState>('none');
  const [couponReason, setCouponReason] = useState<string | undefined>(undefined);
  const [pricing, setPricing] = useState(false);

  // A signature of the cart contents + coupon; re-price on the backend whenever it changes (debounced).
  const sig = items.map((i) => `${i.product.sku}x${i.qty}`).join(',');
  const reqId = useRef(0);
  useEffect(() => {
    if (items.length === 0) {
      setCartDiscount(0);
      setCouponState('none');
      setCouponReason(undefined);
      return;
    }
    const id = ++reqId.current;
    const lineItems = items.map((i) => ({ sku: i.product.sku, quantity: i.qty }));
    setPricing(true);
    const t = setTimeout(() => {
      priceCart(lineItems, coupon || undefined).then((p) => {
        // Ignore stale responses (cart changed again before this resolved).
        if (id !== reqId.current) return;
        setCartDiscount(p.cartDiscountCent);
        setCouponState(p.couponState);
        setCouponReason(p.couponReason);
        setPricing(false);
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, coupon]);

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
      coupon,
      couponState,
      couponReason,
      pricing,
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
      applyCoupon: (code) => setCoupon(code.trim()),
      removeCoupon: () => {
        setCoupon('');
        setCouponState('none');
        setCouponReason(undefined);
      },
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, isOpen, cartDiscount, coupon, couponState, couponReason, pricing]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
