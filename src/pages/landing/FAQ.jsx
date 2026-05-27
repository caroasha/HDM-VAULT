import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const defaultFaqs = [
  { question: 'Is my data encrypted?', answer: 'Yes — zero-knowledge AES-256-GCM encryption.' },
  { question: 'Can I use it on multiple devices?', answer: 'Yes. Syncs across all your devices.' },
  { question: 'What happens after trial?', answer: 'Vault becomes read-only. Upgrade to regain access.' },
];

export default function FAQ({ data }) {
  const faqs = data?.length ? data : defaultFaqs;
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="font-medium text-sm">{faq.question}</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-400">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}