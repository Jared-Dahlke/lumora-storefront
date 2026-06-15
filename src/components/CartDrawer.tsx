import { useEffect, useState } from 'react';
import { useCart } from '../cart';
import { formatUSD } from '../utils';
import SmartImage from './SmartImage';

export default function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal, count, clear } = useCart();
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (isOpen) setOrdered(false);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const checkout = () => {
    setOrdered(true);
    clear();
  };

  return (
    <>
      <div className={`scrim ${isOpen ? 'show' : ''}`} onClick={close} aria-hidden />
      <aside className={`drawer ${isOpen ? 'open' : ''}`} aria-label="Shopping cart" aria-hidden={!isOpen}>
        <div className="drawer-head">
          <h3>{ordered ? 'Order confirmed' : `Your cart${count ? ` · ${count}` : ''}`}</h3>
          <button className="icon-btn" onClick={close} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {ordered ? (
          <div className="drawer-empty">
            <div className="confirm-check">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h4>Thank you.</h4>
            <p>Your Lumora order is on its way. A confirmation has been sent to your inbox.</p>
            <button className="btn btn-primary full" onClick={close}>
              Continue shopping
            </button>
          </div>
        ) : items.length === 0 ? (
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
                      <span className="li-price">{formatUSD(product.priceUSD * qty)}</span>
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
