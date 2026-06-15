import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

const CATEGORY_ORDER = ['Sensors', 'Wearables', 'Supplements', 'Membership'];

function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Introducing Lumora</span>
          <h1>
            Health intelligence
            <br />
            you can wear.
          </h1>
          <p className="hero-sub">
            Continuous insights from a sensor the size of a coin. No fingersticks, no guesswork —
            just clarity, in real time.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary lg" onClick={onShop}>
              Shop the collection
            </button>
            <a className="btn btn-ghost lg" href="#about">
              How it works
            </a>
          </div>
          <div className="hero-trust">
            <span>✓ FSA / HSA eligible</span>
            <span>✓ Free 2-day shipping</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orb" />
          <div className="hero-card">
            <div className="hero-card-row">
              <span className="hc-label">Glucose</span>
              <span className="hc-trend up">Stable</span>
            </div>
            <div className="hero-spark">
              <svg viewBox="0 0 240 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E7C7B" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#0E7C7B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 55 C 30 50, 45 30, 70 35 S 110 60, 140 42 S 195 18, 240 30" fill="none" stroke="#0E7C7B" strokeWidth="3" strokeLinecap="round" />
                <path d="M0 55 C 30 50, 45 30, 70 35 S 110 60, 140 42 S 195 18, 240 30 L 240 80 L 0 80 Z" fill="url(#g)" />
              </svg>
            </div>
            <div className="hero-card-foot">
              <span className="hc-big">112</span>
              <span className="hc-unit">mg/dL</span>
              <span className="hc-time">Updated just now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const features = [
    { t: 'Wear it & forget it', d: 'A coin-sized sensor stays on for 15 days. Shower, sleep, train — it just works.' },
    { t: 'Insights, not data dumps', d: 'Lumora turns raw signals into plain-language guidance you can act on today.' },
    { t: 'Built on real science', d: 'Clinical-grade accuracy from the team that pioneered continuous monitoring.' },
  ];
  return (
    <section id="about" className="about">
      <div className="container">
        <span className="eyebrow center">Why Lumora</span>
        <h2 className="section-title center">Clarity that fits your life.</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.t} className="feature">
              <div className="feature-icon" />
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home({ products }: { products: Product[] }) {
  const [params, setParams] = useSearchParams();
  const activeCat = params.get('cat') ?? 'all';
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c) && c !== 'All');
    return ['all', ...ordered, ...extra];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = activeCat === 'all' || p.category === activeCat;
      const qOk = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [products, activeCat, query]);

  const setCat = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === 'all') next.delete('cat');
    else next.set('cat', c);
    setParams(next, { replace: true });
  };

  const scrollToShop = () => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main>
      <Hero onShop={scrollToShop} />
      <About />

      <section id="shop" className="shop">
        <div className="container">
          <div className="shop-head">
            <div>
              <span className="eyebrow">The collection</span>
              <h2 className="section-title">Everything you need to feel your best.</h2>
            </div>
            <div className="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </div>
          </div>

          <div className="chips" role="tablist" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${activeCat === c ? 'active' : ''}`}
                onClick={() => setCat(c)}
                role="tab"
                aria-selected={activeCat === c}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No products match “{query}”.</p>
              <button className="btn btn-ghost" onClick={() => { setQuery(''); setCat('all'); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
