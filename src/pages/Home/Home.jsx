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
    const { signOut, user, getAccessCode } = useAuth();
    const [surveyStatus, setSurveyStatus] = React.useState({ submitted: false, loading: true });
    const [journeyComplete, setJourneyComplete] = React.useState(false);

    // Format current date as "4 July 2025"
    const getCurrentDate = () => {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleDateString('en-US', { month: 'long' });
        const year = now.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Check survey status and journey completion
    React.useEffect(() => {
        const checkStatus = async () => {
            const accessCode = getAccessCode();
            if (!accessCode) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            try {
                // Check survey status
                const surveyRes = await fetch(`${apiUrl}/api/mirifer/survey/status`, {
                    headers: { 'X-Access-Code': accessCode }
                });
                const surveyData = await surveyRes.json();
                setSurveyStatus({ submitted: surveyData.submitted, loading: false });

                // Check journey progress
                const progressRes = await fetch(`${apiUrl}/api/mirifer/progress`, {
                    headers: { 'X-Access-Code': accessCode }
                });
                const progressData = await progressRes.json();
                setJourneyComplete(progressData.isComplete && progressData.hasCompleteData);
            } catch (err) {
                console.error('Failed to check status:', err);
                setSurveyStatus({ submitted: false, loading: false });
            }
        };

        checkStatus();
    }, [getAccessCode]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="container home-page">
            <div className="top-nav">
                <div className="user-badge">
                    <span className="user-code">{user?.accessCode || user?.displayName}</span>
                </div>
                <div className="date-display">
                    {getCurrentDate()}
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
                <div className="header-content">
                    <div className="header-top">
                        <img src="/logo.png" alt="Mirifer Logo" className="site-logo" />
                        <h1>Mirifer — Uncertainty Reduction System</h1>
                    </div>
                    <ul className="header-principles">
                        <li>Each day takes 10–15 minutes.</li>
                        <li>There is nothing to optimize.</li>
                        <li>When today's step is done, you stop.</li>
                    </ul>
                </div>
            </header>

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

            {journeyComplete && !surveyStatus.submitted && !surveyStatus.loading && (
                <div className="survey-prompt">
                    <p className="survey-message">One final reflection awaits.</p>
                    <NotionButton onClick={() => navigate('/survey')}>
                        Complete Journey Reflection
                    </NotionButton>
                </div>
            )}

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
