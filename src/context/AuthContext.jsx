import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Get API base URL from environment or default to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved access code on mount
        const savedCode = localStorage.getItem('mirifer_access_code');
        const savedUser = localStorage.getItem('mirifer_user');

        if (savedCode && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (accessCode) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid access code');
            }

            // Store credentials
            localStorage.setItem('mirifer_access_code', accessCode);
            localStorage.setItem('mirifer_user', JSON.stringify(data.user));

            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signOut = () => {
        localStorage.removeItem('mirifer_access_code');
        localStorage.removeItem('mirifer_user');
        setUser(null);
    };

    // Get access code for API calls
    const getAccessCode = () => {
        return localStorage.getItem('mirifer_access_code');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signOut, getAccessCode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
