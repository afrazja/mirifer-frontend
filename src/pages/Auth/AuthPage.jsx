import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './AuthPage.css';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        if (authError) {
            setError(authError.message);
        } else {
            setMessage('Check your email for the magic link! ✉️');
        }

        setIsLoading(false);
    };

    return (
        <div className="container auth-page">
            <div className="auth-card">
                <h1>Welcome to Mirifer</h1>
                <p className="instruction">Enter your email to receive a magic login link.</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input"
                    />
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default AuthPage;
