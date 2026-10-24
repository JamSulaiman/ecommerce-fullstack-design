import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const FAQS = [
  {
    question: 'How do I place an order?',
    answer: 'Add available products to your cart, sign in or register, enter your shipping details, and select Place order. Orders use cash on delivery.',
  },
  {
    question: 'Where can I follow my order?',
    answer: 'Sign in and open My profile, then expand My order details to see recent order status and tracking history.',
  },
  {
    question: 'How do I request a bulk or custom quote?',
    answer: 'Open Projects and submit the product, quantity, email address, and project details. The store team can review the request in the admin panel.',
  },
  {
    question: 'How can I contact support?',
    answer: 'Use the contact page to see the available customer-support options.',
  },
  {
    question: 'How do refunds and returns work?',
    answer: 'Contact support with your order number and the reason for your request so the store team can review it.',
  },
  {
    question: 'Where can I check shipping information?',
    answer: 'Shipping address and order status are available in the recent orders section of your profile.',
  },
];

const Help = () => (
  <HelpContent />
);

const HelpContent = () => {
  const location = useLocation();
  return (
  <main className="min-h-screen bg-gray-100 px-4 py-10">
    <div className="max-w-4xl mx-auto rounded-3xl bg-white p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-gray-900">Help center</h1>
      <p className="text-gray-600 mt-2 mb-8">Answers to common shopping and order questions.</p>
      <div className="space-y-3">
        {FAQS.map(({ question, answer }) => {
          const id = question.includes('refund') ? 'refund' : question.includes('shipping') ? 'shipping' : undefined;
          return (
          <details key={question} id={id} open={id && location.hash === `#${id}`} className="rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-semibold text-gray-800">{question}</summary>
            <p className="pt-3 text-sm leading-6 text-gray-600">{answer}</p>
          </details>
        );})}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link to="/contact" className="text-blue-600 hover:underline">Contact support</Link>
        <Link to="/profile#orders" className="text-blue-600 hover:underline">View my orders</Link>
        <Link to="/projects" className="text-blue-600 hover:underline">Request a project quote</Link>
      </div>
    </div>
  </main>
  );
};

export default Help;
