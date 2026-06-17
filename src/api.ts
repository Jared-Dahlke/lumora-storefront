import type { Product, ProductProjection } from './types';
import { STOREFRONT_SKUS, isSubscriptionSku } from './catalog';

const API = import.meta.env.VITE_API_BASE_URL || 'https://openct-api.onrender.com';
const AUTH = import.meta.env.VITE_AUTH_BASE_URL || 'https://openct-auth.onrender.com';
const PROJECT_KEY = import.meta.env.VITE_PROJECT_KEY || 'openct-dev';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'lumora-store';
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET || 'Dk9ECs80MehnXH-biDZT4qKJSxUwgw7j';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fire-and-forget warm-up pings to nudge the Render free-tier services awake. */
export function warmUp(): void {
  fetch(`${API}/health`).catch(() => {});
  fetch(`${AUTH}/health`).catch(() => {});
}

let cachedToken: string | null = null;

/**
 * Fetch an anonymous OAuth token. Retries with backoff to survive cold starts
 * (Render free tier can take 20-50s to spin up).
 */
export async function getAnonymousToken(maxAttempts = 8): Promise<string> {
  if (cachedToken) return cachedToken;
  const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(`${AUTH}/oauth/${PROJECT_KEY}/anonymous/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      if (res.ok) {
        const data = await res.json();
        cachedToken = data.access_token as string;
        return cachedToken;
      }
      lastErr = new Error(`Auth responded ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    // Exponential-ish backoff, capped.
    await sleep(Math.min(2000 + attempt * 1500, 8000));
  }
  throw lastErr ?? new Error('Could not reach the store.');
}

function toProduct(p: ProductProjection): Product {
  const mv = p.masterVariant;
  const usdPrice = mv.prices?.find((pr) => pr.value.currencyCode === 'USD');
  const usd = usdPrice?.value.centAmount;
  const anyPrice = mv.prices?.[0]?.value.centAmount;
  const list = usd ?? anyPrice ?? 0;
  // A product discount (applied by the backend) surfaces as `discounted.value` on the price.
  const sale = usdPrice?.discounted?.value.centAmount ?? mv.prices?.[0]?.discounted?.value.centAmount;
  const category =
    (mv.attributes?.find((a) => a.name === 'category')?.value as string | undefined) ?? 'All';
  return {
    id: p.id,
    sku: mv.sku ?? p.id,
    name: p.name.en ?? 'Untitled',
    slug: p.slug.en ?? p.id,
    description: p.description?.en ?? '',
    category,
    priceUSD: list,
    ...(sale !== undefined && sale < list ? { salePriceUSD: sale } : {}),
    image: mv.images?.[0]?.url,
    subscription: isSubscriptionSku(mv.sku),
  };
}

// ---------- Checkout / order creation ----------

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  streetName: string;
  city: string;
  postalCode: string;
  country: string;
  state: string;
}

export interface CheckoutInput {
  email: string;
  address: ShippingAddress;
  /** SKU + quantity pairs from the client-side cart. */
  lineItems: { sku: string; quantity: number }[];
}

export interface PlacedOrder {
  orderNumber: string;
  id: string;
  totalCentAmount: number;
  currencyCode: string;
  orderState: string;
}

interface CartLike {
  id: string;
  version: number;
  totalPrice?: { centAmount: number; currencyCode: string };
}

async function authedPost<T>(token: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.message || data?.error_description || '';
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status}). Please try again.`);
  }
  return (await res.json()) as T;
}

/**
 * Runs the real 4-step order flow against the backend:
 * create cart -> add line items by SKU -> set shipping address -> create order.
 * Each cart mutation returns an incremented version that is threaded forward.
 */
export async function placeOrder(input: CheckoutInput): Promise<PlacedOrder> {
  const token = await getAnonymousToken();

  // 1) Create the cart.
  let cart = await authedPost<CartLike>(token, `/${PROJECT_KEY}/me/carts`, {
    currency: 'USD',
    country: 'US',
    customerEmail: input.email,
  });

  // 2) Add all line items in one call.
  cart = await authedPost<CartLike>(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
    version: cart.version,
    actions: input.lineItems.map((li) => ({
      action: 'addLineItem',
      sku: li.sku,
      quantity: li.quantity,
    })),
  });

  // 3) Set the shipping address.
  cart = await authedPost<CartLike>(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
    version: cart.version,
    actions: [{ action: 'setShippingAddress', address: input.address }],
  });

  // 4) Create the order from the cart.
  const order = await authedPost<{
    orderNumber: string;
    id: string;
    totalPrice?: { centAmount: number; currencyCode: string };
    orderState: string;
  }>(token, `/${PROJECT_KEY}/me/orders`, {
    id: cart.id,
    version: cart.version,
  });

  return {
    orderNumber: order.orderNumber,
    id: order.id,
    totalCentAmount: order.totalPrice?.centAmount ?? cart.totalPrice?.centAmount ?? 0,
    currencyCode: order.totalPrice?.currencyCode ?? 'USD',
    orderState: order.orderState,
  };
}

export interface CartPricing {
  /** Total cart-discount amount (cents) applied on top of the per-line sale prices. */
  cartDiscountCent: number;
  currencyCode: string;
}

interface PricedCart {
  id: string;
  version: number;
  totalPrice?: { centAmount: number; currencyCode: string };
  lineItems?: {
    quantity: number;
    price: { value: { centAmount: number }; discounted?: { value: { centAmount: number } } };
    totalPrice: { centAmount: number };
  }[];
}

/**
 * Prices the current cart on the backend so cart-level discounts (which depend on cart predicates
 * and can't be computed client-side) are reflected in the UI. Creates a server cart, adds the line
 * items, and returns the total cart-discount amount — i.e. the reduction BELOW the per-line sale
 * prices the storefront already shows. Returns a zero discount if anything fails (cold start, etc.)
 * so the UI degrades to the local subtotal.
 */
export async function priceCart(
  lineItems: { sku: string; quantity: number }[],
): Promise<CartPricing> {
  if (lineItems.length === 0) return { cartDiscountCent: 0, currencyCode: 'USD' };
  try {
    const token = await getAnonymousToken();
    let cart = await authedPost<PricedCart>(token, `/${PROJECT_KEY}/me/carts`, {
      currency: 'USD',
      country: 'US',
    });
    cart = await authedPost<PricedCart>(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
      version: cart.version,
      actions: lineItems.map((li) => ({ action: 'addLineItem', sku: li.sku, quantity: li.quantity })),
    });
    // Cart discount per line = (sale unit price × qty) − line total (after cart discounts).
    let cartDiscountCent = 0;
    for (const li of cart.lineItems ?? []) {
      const unit = li.price.discounted?.value.centAmount ?? li.price.value.centAmount;
      cartDiscountCent += unit * li.quantity - li.totalPrice.centAmount;
    }
    return {
      cartDiscountCent: Math.max(0, cartDiscountCent),
      currencyCode: cart.totalPrice?.currencyCode ?? 'USD',
    };
  } catch {
    return { cartDiscountCent: 0, currencyCode: 'USD' };
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const token = await getAnonymousToken();
  const res = await fetch(
    `${API}/${PROJECT_KEY}/product-projections?staged=false&limit=20`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Could not load products (${res.status})`);
  const data = await res.json();
  const all = (data.results as ProductProjection[]).map(toProduct);
  // Offer a curated set of exactly four products (one of which is the subscription), ordered to
  // match STOREFRONT_SKUS. Falls back to all products if the curated SKUs aren't found.
  const rank = new Map(STOREFRONT_SKUS.map((s, i) => [s.toUpperCase(), i]));
  const curated = all
    .filter((p) => rank.has(p.sku.toUpperCase()))
    .sort((a, b) => (rank.get(a.sku.toUpperCase())! - rank.get(b.sku.toUpperCase())!));
  return curated.length ? curated : all;
}

// ---------- Subscriptions (Recurring Orders) ----------

export interface Subscription {
  id: string;
  recurringOrderState?: string;
  nextOrderAt?: string;
}

/**
 * Starts a "Subscribe & Save" subscription for a single SKU, wired to the ctpro Recurring Orders
 * API. Creates a template cart with the item + a demo shipping address, then a Recurring Order
 * against the recurrence policy (`me/recurring-orders`). ctpro materializes an order from the cart
 * on the policy's schedule (e.g. every 30 days). Payment is demo-only — no card is charged.
 */
export async function createSubscription(sku: string, policyKey: string): Promise<Subscription> {
  const token = await getAnonymousToken();
  let cart = await authedPost<CartLike>(token, `/${PROJECT_KEY}/me/carts`, {
    currency: 'USD',
    country: 'US',
  });
  cart = await authedPost<CartLike>(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
    version: cart.version,
    actions: [{ action: 'addLineItem', sku, quantity: 1 }],
  });
  cart = await authedPost<CartLike>(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
    version: cart.version,
    actions: [
      { action: 'setShippingAddress', address: { country: 'US', firstName: 'Demo', lastName: 'Shopper' } },
    ],
  });
  return authedPost<Subscription>(token, `/${PROJECT_KEY}/me/recurring-orders`, {
    cartId: cart.id,
    recurrencePolicy: { key: policyKey },
  });
}
