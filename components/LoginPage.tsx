
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, GoogleIcon } from './icons/Icons';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
    const { login, signUp, loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isSignUp) {
                await signUp(email, password);
                setShowConfirmationMessage(true);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            if (isSignUp && err.message && err.message.toLowerCase().includes('rate limit exceeded')) {
                setError('Email rate limit reached. Please wait before creating a new account. For developers: A custom SMTP provider is recommended for Supabase projects.');
            } else {
                setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            {showConfirmationMessage ? (
                 <div className="w-full max-w-sm text-center">
                     <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                        <h2 className="text-xl font-semibold text-primary">Check your inbox!</h2>
                        <p className="mt-4 text-muted-foreground">
                            A confirmation link has been sent to <br/><strong>{email}</strong>.
                        </p>
                        <p className="mt-4 text-sm">
                           Please click the link to activate your account.
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            (Don't see it? Check your spam folder.)
                        </p>
                        <button
                            onClick={() => {
                                setShowConfirmationMessage(false);
                                setIsSignUp(false);
                                setEmail('');
                                setPassword('');
                            }}
                            className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors"
                        >
                            Back to Sign In
                        </button>
                     </div>
                </div>
            ) : (
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                            <SparklesIcon className="w-8 h-8 text-primary"/>
                            Roadmap Master
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {isSignUp ? 'Create your account' : 'Sign in to continue'}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-input border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-input border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || isGoogleLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                                </button>
                            </div>
                        </form>
                        
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading || isGoogleLoading}
                                className="w-full flex items-center justify-center gap-3 bg-card border border-border hover:bg-secondary text-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                            >
                               {isGoogleLoading ? ( 'Signing in...' ) : (
                                   <>
                                    <GoogleIcon />
                                    Sign in with Google
                                    </>
                               )}
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setError('');
                                    }}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};