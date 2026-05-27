import { useState, useEffect } from 'react';
import { Download, Monitor, Globe, Smartphone } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { API_BASE_URL } from '../../utils/constants';

const iconMap = {
  windows: Monitor, macos: Monitor, linux: Monitor,
  chrome: Globe, firefox: Globe,
  ios: Smartphone, android: Smartphone
};

const nameMap = {
  windows: 'Windows', macos: 'macOS', linux: 'Linux',
  chrome: 'Chrome Extension', firefox: 'Firefox Add-on',
  ios: 'iOS', android: 'Android'
};

export default function Downloads() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/content/downloads`)
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); })
      .catch(() => {});
  }, []);

  if (!data || !data.enabled || !data.platforms?.length) return null;

  return (
    <section id="downloads" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Download HDM Vault</h2>
          <p className="text-gray-600 dark:text-gray-400">Available on all major platforms.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {data.platforms.map((p) => {
            const Icon = iconMap[p.key] || Monitor;
            const displayName = nameMap[p.key] || p.key;
            return (
              <Card key={p.key} hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="text-orange-500" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{displayName}</h3>
                      {p.badge && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded ml-2 shrink-0">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    {p.label && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{p.label}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(p.url, '_blank', 'noopener,noreferrer')}
                    >
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}