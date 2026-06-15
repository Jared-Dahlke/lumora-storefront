import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CartProvider } from './cart';
import { fetchProducts, warmUp } from './api';
import type { Product } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Loading from './components/Loading';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';

type Status = 'loading' | 'ready' | 'error';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  const load = () => {
    setStatus('loading');
    fetchProducts()
      .then((p) => {
        setProducts(p);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    warmUp();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'error') {
    return (
      <div className="boot">
        <span className="wordmark big">
          <span className="wordmark-dot" />
          Lumora
        </span>
        <p className="boot-msg">We couldn’t reach the store.</p>
        <p className="boot-sub">The server may still be waking up. Please try again.</p>
        <button className="btn btn-primary" onClick={load} style={{ marginTop: 20 }}>
          Try again
        </button>
      </div>
    );
  }

  function NotFound() {
    return (
      <main className="container detail-missing">
        <h2>Page not found</h2>
        <p>The page you’re looking for doesn’t exist or has moved.</p>
        <Link className="btn btn-primary" to="/">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <CartProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home products={products} />} />
        <Route path="/product/:slug" element={<ProductDetail products={products} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
