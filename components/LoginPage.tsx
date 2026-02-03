
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, GoogleIcon } from './icons/Icons';

export const LoginPage: React.FC = () => {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginWithGoogle, loginAsGuest } = useAuth();

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError('');
        try {
            await loginWithGoogle();
        } catch (err) {
            setError('Failed to sign in with Google.');
        } finally {
            setIsGoogleLoading(false);
        }
    }

    const handleGuestLogin = () => {
        loginAsGuest();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <SparklesIcon className="w-8 h-8 text-primary" />
                        Roadmap Master
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to continue
                    </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                    {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                        >
                            {isGoogleLoading ? ('Signing in...') : (
                                <>
                                    <GoogleIcon />
                                    Sign in with Google
                                </>
                            )}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGuestLogin}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};