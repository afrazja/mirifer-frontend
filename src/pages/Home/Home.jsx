import React from 'react';
import { useNavigate } from 'react-router-dom';
import Callout from '../../components/Callout/Callout';
import Toggle from '../../components/Toggle/Toggle';
import NotionButton from '../../components/NotionButton/NotionButton';
import Divider from '../../components/Divider/Divider';
import Journey from '../../components/Journey/Journey';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleDeleteData = async () => {
        const confirm1 = window.confirm("SECURITY & PRIVACY: Are you absolutely sure you want to permanently delete all your data? This will wipe all your reflections and AI responses from our database. This cannot be undone.");
        if (!confirm1) return;

        const confirm2 = window.confirm("FINAL WARNING: This will permanently erase your entire journey history. Continue?");
        if (!confirm2) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/mirifer/data`, {
                method: 'DELETE',
                headers: {
                    'X-Access-Code': user?.accessCode || localStorage.getItem('mirifer_access_code')
                }
            });

            if (response.ok) {
                alert("Your data has been successfully deleted.");
                localStorage.clear();
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete data'}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert("Could not connect to the server to delete data.");
        }
    };



    return (
        <div className="container home-page">
            <div className="top-nav">
                <div className="user-badge">
                    <span className="user-code">{user?.accessCode || user?.displayName}</span>
                </div>
                <NotionButton
                    type="secondary"
                    onClick={handleSignOut}
                    className="sign-out-top"
                >
                    Sign Out
                </NotionButton>
            </div>
            <header className="home-header notion-block">
                <img src="/logo.png" alt="Mirifer Logo" className="site-logo" />
                <h1>Mirifer — Uncertainty Reduction System</h1>
            </header>

            <section className="orientation notion-block">
                <Callout icon="🧭">
                    <strong>Mirifer helps you reduce uncertainty — not solve your life.</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                        <li>Each day takes 10–15 minutes.</li>
                        <li>There is nothing to optimize.</li>
                        <li>When today’s step is done, you stop.</li>
                    </ul>
                </Callout>
            </section>

            <section className="how-it-works notion-block">
                <Toggle title="How Mirifer Works">
                    <div className="explanation-content">
                        <ul>
                            <li>One question per day</li>
                            <li>One reflection with the Mirifer prompt</li>
                            <li>Optional pattern check</li>
                            <li>No advice, no fixing</li>
                            <li>Clear end each day</li>
                        </ul>
                        <p><em>Completion matters more than intensity.</em></p>
                    </div>
                </Toggle>
            </section>

            <Journey />

            <Divider />

            <section className="extra-links notion-block" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <NotionButton
                    type="secondary"
                    onClick={() => navigate('/patterns')}
                >
                    Pattern Overview
                </NotionButton>
                <NotionButton
                    type="secondary"
                    onClick={() => navigate('/direction')}
                >
                    Your Direction
                </NotionButton>
                <NotionButton
                    type="secondary"
                    onClick={handleDeleteData}
                    className="delete-data-btn"
                >
                    Delete My Data
                </NotionButton>
            </section>
        </div>
    );
};

export default Home;
