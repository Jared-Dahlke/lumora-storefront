import { useEffect, useState } from 'react';
import { useCart } from '../cart';
import { formatUSD, effectivePrice } from '../utils';
import { useEscapeKey, useBodyScrollLock } from '../hooks';
import SmartImage from './SmartImage';
import Checkout from './Checkout';

export default function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal, count } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (isOpen) setCheckingOut(false);
  }, [isOpen]);

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, close);

  const checkout = () => {
    setCheckingOut(true);
    close();
  };

  return (
    <>
      {checkingOut && <Checkout onClose={() => setCheckingOut(false)} />}
      <div className={`scrim ${isOpen ? 'show' : ''}`} onClick={close} aria-hidden />
      <aside
        className={`drawer ${isOpen ? 'open' : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="drawer-head">
          <h3>{`Your cart${count ? ` · ${count}` : ''}`}</h3>
          <button className="icon-btn" onClick={close} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <div className="empty-bag">🛍️</div>
            <h4>Your cart is empty</h4>
            <p>Add something to feel your best.</p>
            <button className="btn btn-primary full" onClick={close}>
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="line-item">
                  <div className="li-media">
                    <SmartImage src={product.image} alt={product.name} name={product.name} />
                  </div>
                  <div className="li-info">
                    <div className="li-top">
                      <span className="li-name">{product.name}</span>
                      <button className="li-remove" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}>
                        Remove
                      </button>
                    </div>
                    <div className="li-bottom">
                      <div className="qty">
                        <button onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease quantity">–</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <span className="li-price">
                        {product.salePriceUSD !== undefined && (
                          <span className="price-was sm">{formatUSD(product.priceUSD * qty)}</span>
                        )}
                        {formatUSD(effectivePrice(product) * qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="subtotal-row">
                <span>Subtotal</span>
                <span>{formatUSD(subtotal)}</span>
              </div>
              <p className="ship-note">Free shipping & taxes calculated at checkout.</p>
              <button className="btn btn-primary full" onClick={checkout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
