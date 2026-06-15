import { Link, useParams } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../cart';
import { formatUSD } from '../utils';
import SmartImage from '../components/SmartImage';

const TRUST = [
  { t: 'Free 2-day shipping', d: 'On every order, always.' },
  { t: 'Cancel anytime', d: 'No contracts, no fees.' },
  { t: '30-day guarantee', d: 'Love it or your money back.' },
];

export default function ProductDetail({ products }: { products: Product[] }) {
  const { slug } = useParams();
  const { add, open } = useCart();
  const product = products.find((p) => p.slug === slug);

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
          <div className="detail-price">{formatUSD(product.priceUSD)}</div>
          <p className="detail-desc">
            {product.description ||
              'Engineered for everyday wellness — premium materials, effortless setup, and insights you can actually use.'}
          </p>
          <button
            className="btn btn-primary lg full"
            onClick={() => {
              add(product);
              open();
            }}
          >
            Add to cart
          </button>
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
    </main>
  );
}
