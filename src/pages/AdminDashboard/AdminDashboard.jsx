import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'constrainless4') {
            setIsAuthenticated(true);
            setError('');
            fetchMetrics(password);
        } else {
            setError('Invalid password');
        }
    };

    const fetchMetrics = async (adminPassword) => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/api/admin/metrics`, {
                headers: {
                    'X-Admin-Password': adminPassword
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch metrics');
            }

            const data = await response.json();
            setMetrics(data);
        } catch (err) {
            console.error('Metrics fetch error:', err);
            setError('Failed to load metrics');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
        setMetrics(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <h1>🔒 Admin Dashboard</h1>
                    <p>Enter password to access analytics</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="password-input"
                            autoFocus
                        />
                        {error && <p className="error-text">{error}</p>}
                        <button type="submit" className="login-button">
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>📊 Mirifer Analytics</h1>
                </div>
                <div className="loading-state">Loading metrics...</div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>📊 Mirifer Analytics</h1>
                </div>
                <div className="error-state">Failed to load metrics</div>
            </div>
        );
    }

    const { overview, dropOff, recentSurveys } = metrics;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>📊 Mirifer Analytics</h1>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-label">Total Users</div>
                    <div className="metric-value">{overview.totalUsers}</div>
                </div>

                <div className="metric-card highlight">
                    <div className="metric-label">Completion Rate</div>
                    <div className="metric-value">{overview.completionRate}%</div>
                    <div className="metric-sub">{overview.completedUsers} completed</div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">D1 Retention</div>
                    <div className="metric-value">{overview.d1Retention}%</div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Avg Reflection Words</div>
                    <div className="metric-value">{overview.avgReflectionWords}</div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Survey Submissions</div>
                    <div className="metric-value">{overview.surveySubmissions}</div>
                    <div className="metric-sub">{overview.surveyRate}% of completers</div>
                </div>
            </div>

            <div className="section">
                <h2>📉 Drop-off Analysis</h2>
                <div className="dropoff-chart">
                    {dropOff.map(({ day, users }) => {
                        const maxUsers = Math.max(...dropOff.map(d => d.users));
                        const height = maxUsers > 0 ? (users / maxUsers * 100) : 0;

                        return (
                            <div key={day} className="bar-container">
                                <div
                                    className="bar"
                                    style={{ height: `${height}%` }}
                                    title={`Day ${day}: ${users} users`}
                                />
                                <div className="bar-label">D{day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="section">
                <h2>💬 Recent Survey Responses</h2>
                {recentSurveys.length === 0 ? (
                    <p className="empty-state">No survey responses yet</p>
                ) : (
                    <div className="survey-list">
                        {recentSurveys.map((survey, index) => (
                            <div key={index} className="survey-item">
                                <div className="survey-header">
                                    <span className="survey-user">User {survey.access_code}</span>
                                    <span className="survey-date">
                                        {new Date(survey.submitted_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="survey-content">
                                    <p className="survey-definition">"{survey.definition || 'No definition provided'}"</p>
                                    <div className="survey-meta">
                                        <span>Thought change: {survey.thought_change || 'N/A'}</span>
                                        <span>Would miss: {survey.would_miss === true ? 'Yes' : survey.would_miss === false ? 'No' : 'Unsure'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="dashboard-footer">
                <button onClick={() => fetchMetrics(password)} className="refresh-button">
                    🔄 Refresh Data
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
