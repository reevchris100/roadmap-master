import React, { useState } from 'react';
import { CheckIcon } from './icons/Icons';
import { RazorpayModal } from './RazorpayModal';
import { useAuth } from '../contexts/AuthContext';

const PricingCard: React.FC<{
  plan: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  onSubscribe?: () => void;
}> = ({ plan, price, description, features, isFeatured, onSubscribe }) => {
  const buttonClasses = isFeatured
    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';

  const cardClasses = isFeatured
    ? 'border-primary shadow-lg shadow-primary/10'
    : 'border-border';

  const handleSubscription = () => {
    if (price === 'Free') {
      alert('Getting started with the Free plan!');
      return;
    }
    if (onSubscribe) {
      onSubscribe();
    }
  }

  return (
    <div className={`flex flex-col rounded-lg border ${cardClasses} p-8`}>
      <h3 className="text-2xl font-semibold">{plan}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        {price !== 'Free' && <span className="text-sm font-semibold text-muted-foreground">/month</span>}
      </div>
      <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckIcon className="text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleSubscription}
        className={`mt-auto w-full rounded-md py-2.5 font-semibold transition-colors ${buttonClasses}`}
      >
        {price === 'Free' ? 'Get Started' : 'Subscribe'}
      </button>
    </div>
  );
};

export const PricingPage: React.FC = () => {
  const { upgradeSubscription } = useAuth();
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Choose the plan that's right for you. Get started for free.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PricingCard
            plan="Free"
            price="Free"
            description="Perfect for getting started and exploring."
            features={[
              'Create up to 3 Roadmaps',
              'Public access only',
              'Community support',
            ]}
          />
          <PricingCard
            plan="Pro"
            price="$5"
            description="For professionals and teams who need more power."
            features={[
              'Unlimited Roadmaps',
              'Private & public roadmaps',
              'AI-powered generation',
              'Priority email support',
            ]}
            isFeatured
            onSubscribe={() => setIsRazorpayModalOpen(true)}
          />
        </div>
      </div>
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={upgradeSubscription}
      />
    </>
  );
};
