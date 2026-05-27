export default function Footer({ data, onLegalClick }) {
  const handleLegal = (type) => (e) => {
    e.preventDefault();
    if (onLegalClick) onLegalClick(type);
  };

  return (
    <footer id="footer" className="bg-gray-900 dark:bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-orange-400">Features</a></li>
              <li><a href="#pricing" className="hover:text-orange-400">Pricing</a></li>
              <li><a href="#faq" className="hover:text-orange-400">FAQ</a></li>
              <li><a href="#downloads" className="hover:text-orange-400">Downloads</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-400">About</a></li>
              <li><a href="#" className="hover:text-orange-400">Blog</a></li>
              <li><a href="#" className="hover:text-orange-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" onClick={handleLegal('terms')} className="hover:text-orange-400">Terms</a></li>
              <li><a href="#" onClick={handleLegal('privacy')} className="hover:text-orange-400">Privacy</a></li>
              <li><a href="#" onClick={handleLegal('cookies')} className="hover:text-orange-400">Cookies</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@hdmvault.com" className="hover:text-orange-400">support@hdmvault.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>{data?.copyright || '© 2026 HDM Vault. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}