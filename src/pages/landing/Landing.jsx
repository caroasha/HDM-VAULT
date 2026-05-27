import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Downloads from './Downloads';
import FAQ from './FAQ';
import CTA from './CTA';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import Legal from '../legal/Legal';
import AIChatWidget from '../../components/ai/AIChatWidget';
import { getHero, getFeatures, getFaqs, getTestimonials, getFooter, getPlans, getPaymentMethods, getCurrency, getSiteInfo } from '../../services/publicService';
import Spinner from '../../components/ui/Spinner';

export default function Landing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [legalType, setLegalType] = useState(null);
  const [appName, setAppName] = useState('HDM Vault');

  useEffect(() => {
    Promise.all([
      getSiteInfo(),
      getHero(),
      getFeatures(),
      getFaqs(),
      getTestimonials(),
      getFooter(),
      getPlans(),
      getPaymentMethods(),
      getCurrency()
    ]).then(([siteInfo, hero, features, faqs, testimonials, footer, plans, paymentMethods, currency]) => {
      setData({
        hero: hero?.data || {},
        features: features?.data || [],
        faqs: faqs?.data || [],
        testimonials: testimonials?.data || [],
        footer: footer?.data || {},
        plans: plans?.data || {},
        paymentMethods: paymentMethods?.data || {},
        currency: currency?.data || {}
      });
      if (siteInfo.success && siteInfo.data?.appName) {
        const name = siteInfo.data.appName;
        const tagline = siteInfo.data.tagline;
        setAppName(name);
        document.title = tagline ? `${name} — ${tagline}` : name;
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const openLegal = (type) => { setLegalType(type); };
  const closeLegal = () => { setLegalType(null); };

  if (loading) return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950"><Spinner size="lg" /></div>;
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar onScroll={scrollTo} appName={appName} />
      <Hero data={data.hero} onScroll={scrollTo} />
      <Features data={data.features} />
      <Pricing plans={data.plans} paymentMethods={data.paymentMethods} currency={data.currency} />
      <Testimonials data={data.testimonials} />
      <Downloads />
      <FAQ data={data.faqs} />
      <CTA onScroll={scrollTo} />
      <Footer data={data.footer} onLegalClick={openLegal} />
      <CookieConsent />
      <AIChatWidget />
      {legalType && <Legal type={legalType} onClose={closeLegal} />}
    </div>
  );
}