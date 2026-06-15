export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="wordmark">
            <span className="wordmark-dot" />
            Lumora
          </div>
          <p>Health intelligence you can wear. Continuous insights, beautifully simple.</p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>About</h4>
            <a href="#about">Our story</a>
            <a href="#">Science</a>
            <a href="#">Careers</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Contact</a>
            <a href="#">Shipping</a>
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
        <span>© {new Date().getFullYear()} Lumora. All rights reserved.</span>
        <span className="powered">Powered by openct</span>
      </div>
    </footer>
  );
}
