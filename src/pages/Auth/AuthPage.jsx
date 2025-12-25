import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(accessCode.trim());

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.error || 'Invalid access code');
        }

        setIsLoading(false);
    };

    return (
        <div className="container auth-page">
            <div className="auth-card">
                <h1>Welcome to Mirifer</h1>
                <p className="instruction">Enter your access code to continue.</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Enter access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        required
                        className="auth-input"
                        autoComplete="off"
                        autoFocus
                    />
                    <button type="submit" className="auth-button" disabled={isLoading || !accessCode.trim()}>
                        {isLoading ? 'Verifying...' : 'Enter'}
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>}

                <p className="trial-notice">
                    This is a trial version. Contact admin for an access code.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
