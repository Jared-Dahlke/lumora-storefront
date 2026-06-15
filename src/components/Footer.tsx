export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="wordmark">
            <span className="wordmark-dot" />
            Lumora
          </div>
          <p>Health intelligence you can wear. Continuous insights, beautifully simple.</p>
          <div className="footer-social" aria-label="Social media">
            <a href="#" aria-label="Instagram" className="social">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="social">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="4" />
                <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="social">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Shop</h4>
            <a href="/?cat=Sensors">Sensors</a>
            <a href="/?cat=Wearables">Wearables</a>
            <a href="/?cat=Supplements">Supplements</a>
            <a href="/?cat=Membership">Membership</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#how">How it works</a>
            <a href="#">Our science</a>
            <a href="#">Careers</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Contact</a>
            <a href="#">Shipping &amp; returns</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {year} Lumora. All rights reserved.</span>
        <span className="footer-disclaimer">
          Lumora is a wellness product and is not intended to diagnose, treat, or cure any disease.
        </span>
        <span className="powered">Powered by openct</span>
      </div>
    </footer>
  );
}
