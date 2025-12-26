import React from 'react';
import { useNavigate } from 'react-router-dom';
import Callout from '../../components/Callout/Callout';
import Toggle from '../../components/Toggle/Toggle';
import NotionButton from '../../components/NotionButton/NotionButton';
import Divider from '../../components/Divider/Divider';
import Journey from '../../components/Journey/Journey';
import ReportButton from '../../components/ReportButton/ReportButton';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();

    // Format current date as "4 July 2025"
    const getCurrentDate = () => {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleDateString('en-US', { month: 'long' });
        const year = now.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Logic moved to Journey.jsx for better positioning near the table



    return (
        <div className="container home-page">
            <div className="top-nav">
                <div className="user-info-group">
                    <div className="user-badge">
                        <span className="user-code">{user?.accessCode || user?.displayName}</span>
                    </div>
                    <div className="date-display">
                        {getCurrentDate()}
                    </div>
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

            <ReportButton />

            <Divider />

            <section className="extra-links notion-block" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <NotionButton
                    type="secondary"
                    onClick={() => navigate('/direction')}
                >
                    Your Direction
                </NotionButton>
            </section>
        </div>
    );
};

export default Home;
