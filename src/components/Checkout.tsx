import { useMemo, useState } from 'react';
import { useCart } from '../cart';
import { formatUSD } from '../utils';
import { useEscapeKey, useBodyScrollLock } from '../hooks';
import { placeOrder, type PlacedOrder, type ShippingAddress } from '../api';
import SmartImage from './SmartImage';

type Step = 'shipping' | 'payment' | 'placing' | 'confirmed';

interface Props {
  onClose: () => void;
}

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  streetName: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY: FormState = {
  email: '',
  firstName: '',
  lastName: '',
  streetName: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

const SHIPPING_FIELDS: { key: keyof FormState; label: string; type?: string; half?: boolean; placeholder?: string }[] = [
  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
  { key: 'firstName', label: 'First name', half: true },
  { key: 'lastName', label: 'Last name', half: true },
  { key: 'streetName', label: 'Street address', placeholder: '123 Main St' },
  { key: 'city', label: 'City', half: true },
  { key: 'state', label: 'State', half: true, placeholder: 'CA' },
  { key: 'postalCode', label: 'ZIP code', half: true },
];

export default function Checkout({ onClose }: Props) {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>('shipping');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  // Demo-only card fields — never sent anywhere.
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  useBodyScrollLock(true);
  // Allow Escape to dismiss, but not mid-placement or after the order is confirmed.
  useEscapeKey(step !== 'placing' && step !== 'confirmed', onClose);

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: false }));
  };

  const validateShipping = (): boolean => {
    const next: Partial<Record<keyof FormState, boolean>> = {};
    for (const f of SHIPPING_FIELDS) {
      if (!form[f.key].trim()) next[f.key] = true;
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const lineItems = useMemo(
    () => items.map((i) => ({ sku: i.product.sku, quantity: i.qty })),
    [items],
  );

  const goToPayment = () => {
    if (validateShipping()) setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (step === 'placing') return; // guard against double-submit
    if (lineItems.length === 0) {
      setSubmitError('Your cart is empty. Add an item before placing your order.');
      return;
    }
    setSubmitError(null);
    setStep('placing');
    const address: ShippingAddress = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      streetName: form.streetName.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      country: 'US',
      state: form.state.trim(),
    };
    try {
      const placed = await placeOrder({ email: form.email.trim(), address, lineItems });
      setOrder(placed);
      setStep('confirmed');
      clear();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setStep('payment');
    }
  };

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="checkout-shell">
        <header className="checkout-head">
          <span className="wordmark">
            <span className="wordmark-dot" />
            Lumora
          </span>
          {step !== 'placing' && step !== 'confirmed' && (
            <button className="icon-btn" onClick={onClose} aria-label="Close checkout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </header>

        {step === 'confirmed' && order ? (
          <div className="checkout-body confirm">
            <div className="confirm-check">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2>Thank you, {form.firstName || 'friend'}.</h2>
            <p className="confirm-sub">Your Lumora order has been placed. A confirmation is on its way to {form.email}.</p>
            <div className="confirm-card">
              <div className="confirm-row">
                <span>Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="confirm-row">
                <span>Total</span>
                <strong>{formatUSD(order.totalCentAmount)}</strong>
              </div>
              <div className="confirm-row">
                <span>Status</span>
                <strong>{order.orderState}</strong>
              </div>
            </div>
            <button className="btn btn-primary full lg" onClick={onClose}>
              Continue shopping
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* Left: form steps */}
            <div className="checkout-main">
              <ol className="checkout-steps">
                <li className={step === 'shipping' ? 'active' : 'done'}>1. Shipping</li>
                <li className={step === 'payment' || step === 'placing' ? 'active' : step === 'shipping' ? '' : 'done'}>
                  2. Payment
                </li>
              </ol>

              {step === 'shipping' && (
                <div className="checkout-fields">
                  <h2 className="checkout-h2">Contact &amp; shipping</h2>
                  <div className="field-grid">
                    {SHIPPING_FIELDS.map((f) => (
                      <label key={f.key} className={`field ${f.half ? 'half' : ''} ${errors[f.key] ? 'invalid' : ''}`}>
                        <span>{f.label}</span>
                        <input
                          type={f.type || 'text'}
                          value={form[f.key]}
                          placeholder={f.placeholder}
                          onChange={(e) => set(f.key, e.target.value)}
                          autoComplete={f.key === 'email' ? 'email' : undefined}
                        />
                      </label>
                    ))}
                    <label className="field half">
                      <span>Country</span>
                      <input type="text" value="United States" disabled />
                    </label>
                  </div>
                  <button className="btn btn-primary full lg" onClick={goToPayment} style={{ marginTop: 20 }}>
                    Continue to payment
                  </button>
                </div>
              )}

              {(step === 'payment' || step === 'placing') && (
                <div className="checkout-fields">
                  <h2 className="checkout-h2">Payment</h2>
                  <div className="demo-note">Demo only — no card is charged.</div>
                  <div className="field-grid">
                    <label className="field">
                      <span>Card number</span>
                      <input
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                        onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                        disabled={step === 'placing'}
                      />
                    </label>
                    <label className="field half">
                      <span>Expiry</span>
                      <input
                        placeholder="MM / YY"
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                        disabled={step === 'placing'}
                      />
                    </label>
                    <label className="field half">
                      <span>CVC</span>
                      <input
                        inputMode="numeric"
                        placeholder="123"
                        value={card.cvc}
                        onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                        disabled={step === 'placing'}
                      />
                    </label>
                  </div>

                  {submitError && <div className="checkout-error">{submitError}</div>}

                  <div className="checkout-actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => setStep('shipping')}
                      disabled={step === 'placing'}
                    >
                      Back
                    </button>
                    <button className="btn btn-primary lg" onClick={handlePlaceOrder} disabled={step === 'placing'}>
                      {step === 'placing' ? (
                        <span className="placing">
                          <span className="spinner-sm" />
                          Placing order…
                        </span>
                      ) : (
                        `Place order · ${formatUSD(subtotal)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: order summary */}
            <aside className="checkout-summary">
              <h3>Order summary</h3>
              <div className="summary-items">
                {items.map(({ product, qty }) => (
                  <div key={product.id} className="summary-item">
                    <div className="summary-media">
                      <SmartImage src={product.image} alt={product.name} name={product.name} />
                      <span className="summary-qty">{qty}</span>
                    </div>
                    <span className="summary-name">{product.name}</span>
                    <span className="summary-price">{formatUSD(product.priceUSD * qty)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatUSD(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatUSD(subtotal)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
