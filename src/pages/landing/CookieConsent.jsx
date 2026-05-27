import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('hdm_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('hdm_cookie_consent', 'all');
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('hdm_cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            We use cookies to enhance your experience. See our{' '}
            <span className="text-orange-500 cursor-pointer hover:underline">Cookie Policy</span>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={acceptEssential}>
            Essential Only
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}