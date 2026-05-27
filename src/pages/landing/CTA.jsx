import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function CTA({ data }) {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Secure Your Digital Life?</h2>
        <p className="text-orange-100 mb-8 text-lg">No credit card required • 14 days free</p>
        <Link to="/register"><Button variant="secondary" size="lg">Start Free Trial</Button></Link>
      </div>
    </section>
  );
}