import { Shield } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Hero({ data }) {
  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-gray-950" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
            <Shield size={16} />
            All-in-one cybersecurity suite
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {data?.title || 'Your Digital Life, Fortified'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {data?.subtitle || 'All-in-one cybersecurity suite — Password Manager, VPN, Threat Shield, Breach Monitor & AI Security Assistant'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToPricing} className="bg-red-500 hover:bg-red-600 text-white border-none">
              {data?.ctaPrimary || 'Start Free Trial'}
            </Button>
            <Button variant="outline" size="lg" onClick={scrollToPricing}>
              {data?.ctaSecondary || 'Compare Plans'}
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">No credit card required • 14 days free • Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}