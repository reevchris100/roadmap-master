import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon, XIcon } from './icons/Icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message = "Create an account to continue" }) => {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm relative animate-fade-in-up p-8">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <XIcon />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
                    <p className="text-muted-foreground">{message}</p>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : (
                        <>
                            <GoogleIcon />
                            Sign in with Google
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
