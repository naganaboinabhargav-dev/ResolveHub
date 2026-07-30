import { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FAQS = [
  {
    q: 'Can I use ResolveHub with my own MongoDB database?',
    a: 'Yes — ResolveHub ships as a standard Node/Express + MongoDB application. Point the MONGO_URI environment variable at any MongoDB instance, local or hosted.',
  },
  {
    q: 'How are dynamic ticket forms configured?',
    a: 'Admins define categories with their own subcategories and field sets from the Categories page. Ticket forms adapt automatically based on the category a client selects.',
  },
  {
    q: 'Is there a role for support agents specifically?',
    a: 'Yes — agents get a focused workspace showing only tickets assigned to them, with internal notes and status controls scoped to their queue.',
  },
  {
    q: 'Does the chatbot replace human support?',
    a: 'No — it handles quick FAQs and ticket-status lookups, then routes anything more complex to a real ticket that your team resolves.',
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-paper py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Common questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-ink">{f.q}</span>
                {openIndex === i ? <FiMinus className="shrink-0 text-brand-500" /> : <FiPlus className="shrink-0 text-muted" />}
              </button>
              {openIndex === i && <p className="px-6 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
