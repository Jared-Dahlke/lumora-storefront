import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../cart';
import { formatUSD } from '../utils';
import SmartImage from './SmartImage';

export default function ProductCard({ product }: { product: Product }) {
  const { add, open } = useCart();

  const blurb = product.description
    ? product.description.length > 96
      ? product.description.slice(0, 96).trimEnd() + '…'
      : product.description
    : 'Premium wellness, engineered.';

  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card-media" aria-label={product.name}>
        <SmartImage src={product.image} alt={product.name} name={product.name} />
        <span className="card-chip">{product.category}</span>
      </Link>
      <div className="card-body">
        <Link to={`/product/${product.slug}`} className="card-title">
          {product.name}
        </Link>
        <p className="card-blurb">{blurb}</p>
        <div className="card-foot">
          <span className="card-price">{formatUSD(product.priceUSD)}</span>
          <button
            className="btn btn-pill"
            onClick={() => {
              add(product);
              open();
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
