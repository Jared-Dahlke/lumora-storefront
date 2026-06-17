import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../cart';
import { formatUSD, discountPct } from '../utils';
import { createSubscription, type Subscription } from '../api';
import { SUBSCRIPTION } from '../catalog';
import SmartImage from '../components/SmartImage';
import ProductCard from '../components/ProductCard';

const TRUST = [
  { t: 'Free 2-day shipping', d: 'On every order, always.' },
  { t: 'Cancel anytime', d: 'No contracts, no fees.' },
  { t: '15-day guarantee', d: 'Love it or your money back.' },
];

const HIGHLIGHTS = [
  'Clinical-grade accuracy, validated in the lab',
  'Effortless setup — ready in under a minute',
  'Works seamlessly with the Lumora app',
];

export default function ProductDetail({ products }: { products: Product[] }) {
  const { slug } = useParams();
  const { add, open } = useCart();
  const [subBusy, setSubBusy] = useState(false);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const product = products.find((p) => p.slug === slug);

  const subscribe = async (sku: string): Promise<void> => {
    setSubBusy(true);
    setSubMsg(null);
    try {
      const sub: Subscription = await createSubscription(sku, SUBSCRIPTION.policyKey);
      const next = sub.nextOrderAt ? new Date(sub.nextOrderAt).toLocaleDateString() : 'soon';
      setSubMsg(`You're subscribed! Your next order ships ${next} (${SUBSCRIPTION.cadenceLabel}).`);
    } catch (e) {
      setSubMsg(e instanceof Error ? e.message : 'Could not start the subscription.');
    } finally {
      setSubBusy(false);
    }
  };

  if (!product) {
    return (
      <main className="container detail-missing">
        <h2>Product not found</h2>
        <p>The item you’re looking for isn’t available.</p>
        <Link className="btn btn-primary" to="/">
          Back to shop
        </Link>
      </main>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <main className="container detail">
      <Link to="/" className="breadcrumb">
        ← Back to shop
      </Link>
      <div className="detail-grid">
        <div className="detail-media">
          <SmartImage src={product.image} alt={product.name} name={product.name} />
          <span className="card-chip">{product.category}</span>
        </div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          {product.salePriceUSD !== undefined ? (
            <div className="detail-price on-sale">
              <span className="price-now">{formatUSD(product.salePriceUSD)}</span>
              <span className="price-was">{formatUSD(product.priceUSD)}</span>
              {discountPct(product) > 0 && <span className="sale-badge inline">−{discountPct(product)}%</span>}
            </div>
          ) : (
            <div className="detail-price">{formatUSD(product.priceUSD)}</div>
          )}
          <p className="detail-desc">
            {product.description ||
              'Engineered for everyday wellness — premium materials, effortless setup, and insights you can actually use.'}
          </p>
          <ul className="detail-highlights">
            {HIGHLIGHTS.map((h) => (
              <li key={h}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {h}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary lg full"
            onClick={() => {
              add(product);
              open();
            }}
          >
            Add to cart · {formatUSD(product.priceUSD)}
          </button>
          {product.subscription && (
            <div className="subscribe-block">
              <button
                className="btn btn-ghost lg full subscribe-btn"
                disabled={subBusy}
                onClick={() => void subscribe(product.sku)}
              >
                {subBusy ? 'Starting subscription…' : `Subscribe & Save · ${SUBSCRIPTION.cadenceLabel}`}
              </button>
              <p className="subscribe-note">
                Auto-delivered {SUBSCRIPTION.cadenceLabel}. Cancel anytime. (Demo — no card charged.)
              </p>
              {subMsg && <p className="subscribe-msg">{subMsg}</p>}
            </div>
          )}
          <div className="trust-badges">
            {TRUST.map((b) => (
              <div key={b.t} className="trust-badge">
                <strong>{b.t}</strong>
                <span>{b.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2 className="section-title">You might also like</h2>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
