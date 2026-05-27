import { Shield, Zap, Cpu, Lock, Smartphone, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';

const iconMap = {
  shield: Shield,
  zap: Zap,
  cpu: Cpu,
  lock: Lock,
  smartphone: Smartphone,
  'alert-triangle': AlertTriangle,
};

export default function Features({ data }) {
  const features = data?.length ? data : [
    { icon: 'shield', title: 'Password Vault', description: 'Unlimited storage with zero-knowledge encryption.' },
    { icon: 'zap', title: 'Threat Shield', description: 'Real-time blocking of malicious URLs and phishing.' },
    { icon: 'cpu', title: 'AI Security Assistant', description: '24/7 intelligent monitoring with instant alerts.' },
    { icon: 'lock', title: 'VPN Protection', description: 'WireGuard VPN with kill switch and no-log policy.' },
    { icon: 'smartphone', title: 'All Platforms', description: 'Web, Desktop, Mobile, and Browser Extension.' },
    { icon: 'alert-triangle', title: 'Breach Monitor', description: 'Instant alerts when your data appears in breaches.' },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HDM Vault?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Complete protection for your digital life across all devices.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <Card key={i} hover className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-orange-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}