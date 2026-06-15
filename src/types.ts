export interface Money {
  centAmount: number;
  currencyCode: string;
  fractionDigits?: number;
}

export interface Price {
  id: string;
  value: Money;
}

export interface ProductImage {
  url: string;
  dimensions?: { w: number; h: number };
}

export interface Attribute {
  name: string;
  value: unknown;
}

export interface Variant {
  sku?: string;
  prices?: Price[];
  images?: ProductImage[];
  attributes?: Attribute[];
}

export interface ProductProjection {
  id: string;
  version: number;
  name: { en?: string };
  slug: { en?: string };
  description?: { en?: string };
  masterVariant: Variant;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  priceUSD: number; // cents
  image?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}
