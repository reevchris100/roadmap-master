import React, { useState, useEffect } from 'react';
import { XIcon, SparklesIcon, CheckCircleIcon } from './icons/Icons';

interface RazorpayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paymentId: string) => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amount = billingCycle === 'monthly' ? 500 : 2000; // In smallest currency unit (e.g. 500 = 5.00 INR/USD depends on currency) - wait, Razorpay defaults to INR.
    // Standard pricing: 5 USD ~ 400 INR. Let's assume user wants USD or INR.
    // Usually Razorpay is INR focused but supports international.
    // I will assume INR for simplicity or just generic "units".
    // Let's set it to 499 INR (Monthly) and 1999 INR (Yearly) as standard SaaS pricing in India, or use USD if key supports it.
    // User asked for "$5" previously.
    // 5 USD * 100 cents = 500. Currency = USD.

    const currency = "USD";
    const displayAmount = billingCycle === 'monthly' ? "$5.00" : "$20.00";

    useEffect(() => {
        // Load Razorpay Script
        if (isOpen) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
            return () => {
                document.body.removeChild(script);
            }
        }
    }, [isOpen]);

    const handlePayment = () => {
        setLoading(true);
        setError(null);

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder", // Enter the Key ID generated from the Dashboard
            amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: currency,
            name: "Roadmap Master",
            description: `Pro Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
            image: "https://your-logo-url.com/logo.png", // Optional
            handler: function (response: any) {
                // alert(response.razorpay_payment_id);
                // alert(response.razorpay_order_id);
                // alert(response.razorpay_signature);
                onSuccess(response.razorpay_payment_id);
                setLoading(false);
                onClose();
            },
            prefill: {
                name: "User Name", // Fetch from context if available
                email: "user@example.com",
                contact: "9999999999"
            },
            notes: {
                address: "Roadmap Master Corporate Office"
            },
            theme: {
                color: "#3399cc"
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                }
            }
        };

        if (!(window as any).Razorpay) {
            setError("Razorpay SDK failed to load. Please check your internet connection.");
            setLoading(false);
            return;
        }

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
            setError(`Payment failed: ${response.error.description}`);
            setLoading(false);
        });
        rzp1.open();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
                    <XIcon />
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SparklesIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Unlock unlimited roadmaps and AI generation.
                        </p>
                    </div>

                    {/* Billing Cycle Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-secondary p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${billingCycle === 'monthly'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Monthly ($5)
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${billingCycle === 'yearly'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Yearly ($20)
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
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

                    {error && (
                        <div className="bg-red-500/10 text-red-500 text-xs p-3 rounded-md mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : `Pay ${displayAmount} with Razorpay`}
                    </button>

                    <p className="text-center text-xs text-muted-foreground mt-4">
                        {billingCycle === 'yearly' ? 'Save $40 per year!' : 'Cancel anytime.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
