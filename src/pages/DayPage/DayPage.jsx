import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MIRIFER_DAYS } from '../../data/days';
import Callout from '../../components/Callout/Callout';
import Divider from '../../components/Divider/Divider';
import NotionButton from '../../components/NotionButton/NotionButton';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SharePostcard from '../../components/SharePostcard/SharePostcard';

import { useAuth } from '../../context/AuthContext';
import './DayPage.css';

const DayPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getAccessCode } = useAuth();
    const dayId = parseInt(id);
    const dayData = MIRIFER_DAYS.find(d => d.day === dayId);

    // Question 1 state
    const [reflection1, setReflection1] = useState('');
    const [llmResponse1, setLlmResponse1] = useState('');
    const [isCompleted1, setIsCompleted1] = useState(false);

    // Question 2 state
    const [question2, setQuestion2] = useState('');
    const [reflection2, setReflection2] = useState('');
    const [llmResponse2, setLlmResponse2] = useState('');
    const [isCompleted2, setIsCompleted2] = useState(false);
    const [noFollowupNeeded, setNoFollowupNeeded] = useState(false);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [generatingQuestion, setGeneratingQuestion] = useState(false);
    const [error, setError] = useState('');
    const [generationCount, setGenerationCount] = useState(0);

    // Load from backend (which checks user_id via auth token)
    useEffect(() => {
        const loadEntries = async () => {
            const accessCode = getAccessCode();
            if (!accessCode) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            try {
                const response = await fetch(`${apiUrl}/api/mirifer/entries`, {
                    headers: {
                        'X-Access-Code': accessCode
                    }
                });
                const data = await response.json();

                if (data.entries) {
                    const entry = data.entries.find(e => e.day === dayId);
                    if (entry) {
                        setReflection(entry.user_text || '');
                        setLlmResponse(entry.ai_text || '');
                        setIsCompleted(!!entry.is_completed);
                    } else {
                        // Reset for new day
                        setReflection('');

                        setIsCompleted(false);
                        setLlmResponse('');
                        setGenerationCount(0);
                    }
                }
            } catch (err) {
                console.error('Failed to load entries:', err);
            }
        };

        loadEntries();
    }, [dayId, getAccessCode]);

    // Save to Backend and LocalStorage
    const saveData = async (newReflection, completedStatus = isCompleted, newLlmResponse = llmResponse, newGenCount = generationCount) => {
        const content = {
            reflection: newReflection,

            isCompleted: completedStatus,
            llmResponse: newLlmResponse,
            generationCount: newGenCount
        };

        // 1. Update LocalStorage for immediate persistence/fallback
        localStorage.setItem(`mirifer_day_${dayId}`, JSON.stringify(content));

        const journeyState = JSON.parse(localStorage.getItem('mirifer_journey') || '{}');
        journeyState[dayId] = completedStatus ? 'Complete' : 'In progress';
        localStorage.setItem('mirifer_journey', JSON.stringify(journeyState));

        // 2. Update Backend
        const accessCode = getAccessCode();
        if (!accessCode) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        try {
            await fetch(`${apiUrl}/api/mirifer/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Code': accessCode
                },
                body: JSON.stringify({
                    day: dayId,
                    userText: newReflection,
                    aiText: newLlmResponse,
                    isCompleted: completedStatus,
                    title: dayData?.title || `Day ${dayId}`,
                    question: dayData?.question || ''
                })
            });
        } catch (err) {
            console.error('Failed to sync with backend:', err);
            setError('Cloud sync failed. Data saved locally.');
        }
    };

    const handleReflectionChange = (e) => {
        if (isCompleted) return;
        setReflection(e.target.value);
        // Removed saveData call to prevent persistence on refresh for incomplete days
    };

    const togglePattern = (pattern) => {
        if (isCompleted) return;
        const newPatterns = patterns.includes(pattern)
            ? patterns.filter(p => p !== pattern)
            : [...patterns, pattern];
        setPatterns(newPatterns);
        // Removed saveData call
    };

    const getMiriferReflection = async () => {
        if (!reflection.trim()) {
            setError('Please write your reflection first.');
            return;
        }

        setIsLoading(true);
        setError('');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/api/mirifer/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Code': getAccessCode()
                },
                body: JSON.stringify({
                    day: dayId,
                    userText: reflection,
                    title: dayData?.title || `Day ${dayId}`,
                    question: dayData?.question || '',
                    mode: (dayId === 7 || dayId === 14) ? 'synthesis' : 'mirror'
                })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setLlmResponse(data.text);
                const newCount = generationCount + 1;
                setGenerationCount(newCount);
                // Backend now saves directly, but we still call saveData for local state sync
                saveData(reflection, isCompleted, data.text, newCount);
            }
        } catch (err) {
            setError('Could not connect to the Mirifer server.');
        } finally {
            setIsLoading(false);
        }
    };

    const closeDay = () => {
        setIsCompleted(true);
        saveData(reflection, true);
    };

    if (!dayData) return <div className="container">Day not found.</div>;

    return (
        <div className="container day-page">
            <nav className="breadcrumb-nav">
                <Link to="/" className="back-link">← Back to Journey</Link>
                <span className="progress-indicator">Day {dayId} of 14</span>
            </nav>

            <header className="day-header notion-block">
                <h1 className="day-title">Day {dayId} — {dayData.title}</h1>
            </header>

            <section className="focus-section notion-block">
                <Callout icon="🎯" type="info">
                    <strong>Today's focus:</strong> {dayData.focus}
                </Callout>
            </section>

            <section className="reflection-section notion-block">
                <h3>Primary Reflection</h3>
                <p><strong>{dayData.question}</strong></p>
                <textarea
                    className="reflection-input"
                    placeholder="Write your reflection here..."
                    value={reflection}
                    onChange={handleReflectionChange}
                    readOnly={isCompleted}
                />
            </section>



            <section className="mirifer-reflection-section notion-block">
                <h3>Mirifer's Reflection</h3>
                {isCompleted ? (
                    <div className="reflection-output">
                        {llmResponse ? (
                            <div className="llm-text">{llmResponse}</div>
                        ) : (
                            <div className="reflection-placeholder" style={{ textAlign: 'center', opacity: 0.6 }}>
                                <p><em>This reflection content was wiped for privacy.</em></p>
                            </div>
                        )}
                    </div>
                ) : llmResponse ? (
                    <div className="reflection-output">
                        <div className="llm-text">{llmResponse}</div>
                        {generationCount < 2 && (
                            <div className="regeneration-area" style={{ marginTop: '16px' }}>
                                <NotionButton
                                    type="secondary"
                                    onClick={getMiriferReflection}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Regenerating...' : 'Regenerate once'}
                                </NotionButton>
                            </div>
                        )}

                        {/* Share Postcard */}
                        <SharePostcard day={dayId} aiText={llmResponse} />
                    </div>
                ) : (
                    <div className="reflection-placeholder" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <p className="instruction" style={{ marginBottom: '16px' }}>
                            {dayId === 14
                                ? "When you have reflected on your journey, generate your direction constraint."
                                : "When you're ready, request a mirrored reflection of your thoughts."}
                        </p>
                        <NotionButton
                            type="primary"
                            onClick={getMiriferReflection}
                            disabled={isLoading || !reflection.trim()}
                        >
                            {isLoading ? 'Processing...' : (dayId === 14 ? 'Generate Direction Constraint' : 'Get Mirifer Reflection')}
                        </NotionButton>
                        {error && <p className="error-message" style={{ color: 'var(--error-color)', marginTop: '12px', fontSize: '0.9rem' }}>{error}</p>}
                    </div>
                )}
            </section>

            <Divider />

            <section className="close-section notion-block">
                {isCompleted ? (
                    <div className="completion-message">
                        <p>✅ Today is complete.</p>
                        <p className="instruction">Do not revisit this entry. There is nothing else to do today.</p>
                        {dayId < 14 && (
                            <NotionButton onClick={() => navigate(`/day/${dayId + 1}`)}>
                                Continue to Day {dayId + 1}
                            </NotionButton>
                        )}
                    </div>
                ) : (
                    <div className="action-area">
                        <NotionButton onClick={closeDay} type="primary">
                            Close the Day
                        </NotionButton>
                        <p className="instruction" style={{ marginTop: '12px' }}>This marks the day as complete and locks your response.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default DayPage;
