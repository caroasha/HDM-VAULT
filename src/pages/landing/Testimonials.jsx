import { Star } from 'lucide-react';
import Card from '../../components/ui/Card';

const defaultTestimonials = [
  { name: 'James K.', role: 'Developer', quote: 'Best password manager I have ever used.', rating: 5 },
  { name: 'Mary W.', role: 'Business Owner', quote: 'Finally an all-in-one security app that works.', rating: 5 },
  { name: 'Alex M.', role: 'Freelancer', quote: 'My passwords have never been safer.', rating: 5 },
];

export default function Testimonials({ data }) {
  const testimonials = data?.length ? data : defaultTestimonials;

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Users Worldwide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}