import type { Product, ProductProjection } from './types';

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
  const usd = mv.prices?.find((pr) => pr.value.currencyCode === 'USD')?.value.centAmount;
  const anyPrice = mv.prices?.[0]?.value.centAmount;
  const category =
    (mv.attributes?.find((a) => a.name === 'category')?.value as string | undefined) ?? 'All';
  return {
    id: p.id,
    sku: mv.sku ?? p.id,
    name: p.name.en ?? 'Untitled',
    slug: p.slug.en ?? p.id,
    description: p.description?.en ?? '',
    category,
    priceUSD: usd ?? anyPrice ?? 0,
    image: mv.images?.[0]?.url,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const token = await getAnonymousToken();
  const res = await fetch(
    `${API}/${PROJECT_KEY}/product-projections?staged=false&limit=20`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Could not load products (${res.status})`);
  const data = await res.json();
  return (data.results as ProductProjection[]).map(toProduct);
}
