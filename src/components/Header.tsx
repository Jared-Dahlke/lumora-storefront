import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../cart';
import { useEscapeKey } from '../hooks';

const NAV = [
  { label: 'Sensors', cat: 'Sensors' },
  { label: 'Wearables', cat: 'Wearables' },
  { label: 'Supplements', cat: 'Supplements' },
  { label: 'How it works', cat: 'how' },
];

export default function Header() {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEscapeKey(menuOpen, () => setMenuOpen(false));

  const goto = (cat: string) => {
    setMenuOpen(false);
    const scrollToId = (id: string) =>
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
      );
    if (cat === 'how') {
      navigate('/');
      scrollToId('how');
      return;
    }
    if (cat === 'all') {
      navigate('/');
      scrollToId('shop');
      return;
    }
    navigate(`/?cat=${encodeURIComponent(cat)}`);
    scrollToId('shop');
  };

  return (
    <header className={`header ${scrolled || menuOpen ? 'scrolled' : ''}`}>
      <div className="header-inner container">
        <Link to="/" className="wordmark" aria-label="Lumora home" onClick={() => setMenuOpen(false)}>
          <span className="wordmark-dot" />
          Lumora
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV.map((n) => (
            <button key={n.label} className="nav-link" onClick={() => goto(n.cat)}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="cart-button" onClick={open} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV.map((n) => (
          <button key={n.label} className="mobile-link" onClick={() => goto(n.cat)}>
            {n.label}
          </button>
        ))}
      </div>
    </header>
  );
}
