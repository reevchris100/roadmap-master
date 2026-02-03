import React, { useState } from 'react';
import { XIcon, SparklesIcon, CheckCircleIcon } from './icons/Icons';

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayPalModal: React.FC<PayPalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleUpgrade = () => {
    setStatus('processing');
    setTimeout(() => {
      onSuccess();
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up overflow-hidden">
        {status === 'idle' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
            <XIcon />
          </button>
        )}

        {status === 'idle' ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
              <p className="text-muted-foreground mt-2">
                You've reached the 3-roadmap limit on the Free plan. Unlock unlimited creativity!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Unlimited Roadmaps</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Advanced AI Generation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Priority Support</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-md transition-colors shadow-lg shadow-primary/25"
            >
              Upgrade for $10/mo
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Secure payment via mock-PayPal. Cancel anytime.
            </p>
          </div>
        ) : (
          <div className="p-12 text-center">
            {status === 'processing' && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="text-lg font-semibold">Processing Upgrade...</h3>
                <p className="text-muted-foreground text-sm">Please wait a moment.</p>
              </div>
            )}
            {status === 'success' && (
              <div className="flex flex-col items-center justify-center space-y-4 animate-scale-in">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-500">Welcome to Pro!</h3>
                <p className="text-muted-foreground text-sm">Your account has been upgraded successfully.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
