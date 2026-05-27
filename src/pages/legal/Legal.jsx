import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { getLegal } from '../../services/publicService';
import Spinner from '../../components/ui/Spinner';

export default function Legal({ type, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(type || 'terms');

  const titles = { terms: 'Terms of Service', privacy: 'Privacy Policy', cookies: 'Cookie Policy' };

  useEffect(() => {
    setActiveTab(type || 'terms');
  }, [type]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getLegal(activeTab)
      .then(res => {
        if (res.success) {
          setContent(res.data?.content || '<p>No content available.</p>');
        } else {
          setError(res.message || 'Document not found');
        }
      })
      .catch(() => setError('Failed to load document'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{titles[activeTab]}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Spinner /></div>
          ) : error ? (
            <p className="text-red-500 text-center py-12">{error}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {['terms', 'privacy', 'cookies'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-3 py-1.5 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-orange-100 dark:bg-orange-900 text-orange-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {titles[tab]}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={onClose} className="text-sm px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Close</button>
        </div>
      </div>
    </div>
  );
}