import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../cart';

const NAV = [
  { label: 'Shop', cat: 'all' },
  { label: 'Sensors', cat: 'Sensors' },
  { label: 'Supplements', cat: 'Supplements' },
  { label: 'About', cat: 'about' },
];

export default function Header() {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goto = (cat: string) => {
    if (cat === 'about') {
      navigate('/');
      requestAnimationFrame(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }));
      return;
    }
    navigate(cat === 'all' ? '/' : `/?cat=${encodeURIComponent(cat)}`);
    requestAnimationFrame(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner container">
        <Link to="/" className="wordmark" aria-label="Lumora home">
          <span className="wordmark-dot" />
          Lumora
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.label} className="nav-link" onClick={() => goto(n.cat)}>
              {n.label}
            </button>
          ))}
        </nav>
        <button className="cart-button" onClick={open} aria-label={`Open cart, ${count} items`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
      </div>
    </header>
  );
}
