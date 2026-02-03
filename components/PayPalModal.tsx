
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/Icons';

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayPalModal: React.FC<PayPalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    if (isOpen && status === 'idle') {
      setStatus('processing');
      const timer = setTimeout(() => {
        onSuccess();
        setStatus('success');
        // Close modal after showing success message
        setTimeout(() => {
          onClose();
          setStatus('idle'); // Reset for next time
        }, 1500); 
      }, 2500); // Simulate network delay

      return () => clearTimeout(timer);
    }
  }, [isOpen, status, onSuccess, onClose]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm relative animate-fade-in-up">
        {status !== 'processing' && (
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <XIcon />
            </button>
        )}
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Complete Your Purchase</h2>
            <p className="text-muted-foreground text-sm mb-6">You are subscribing to the Pro Plan for $10/month.</p>

            {status === 'processing' && (
                <div className="flex flex-col items-center justify-center space-y-4 h-32">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-muted-foreground">Processing payment securely...</p>
                </div>
            )}
            {status === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-4 h-32">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold text-green-500">Payment Successful!</p>
                    <p className="text-sm text-muted-foreground">Welcome to Pro!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
