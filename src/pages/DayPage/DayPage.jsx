import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MIRIFER_DAYS, PATTERN_OPTIONS } from '../../data/days';
import Callout from '../../components/Callout/Callout';
import Divider from '../../components/Divider/Divider';
import NotionButton from '../../components/NotionButton/NotionButton';
import './DayPage.css';

const DayPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dayId = parseInt(id);
    const dayData = MIRIFER_DAYS.find(d => d.day === dayId);

    const [reflection, setReflection] = useState('');
    const [patterns, setPatterns] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [llmResponse, setLlmResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generationCount, setGenerationCount] = useState(0);

    // Load from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem(`mirifer_day_${dayId}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setReflection(parsed.reflection || '');
            setPatterns(parsed.patterns || []);
            setIsCompleted(parsed.isCompleted || false);
            setLlmResponse(parsed.llmResponse || '');
            setGenerationCount(parsed.generationCount || 0);
        }
    }, [dayId]);

    // Save to localStorage
    const saveData = (newReflection, newPatterns, completedStatus = isCompleted, newLlmResponse = llmResponse, newGenCount = generationCount) => {
        const dataToSave = {
            reflection: newReflection,
            patterns: newPatterns,
            isCompleted: completedStatus,
            llmResponse: newLlmResponse,
            generationCount: newGenCount
        };
        localStorage.setItem(`mirifer_day_${dayId}`, JSON.stringify(dataToSave));

        // Update global journey status
        const journeyState = JSON.parse(localStorage.getItem('mirifer_journey') || '{}');
        journeyState[dayId] = completedStatus ? 'Complete' : 'In progress';
        localStorage.setItem('mirifer_journey', JSON.stringify(journeyState));
    };

    const handleReflectionChange = (e) => {
        if (isCompleted) return;
        setReflection(e.target.value);
        saveData(e.target.value, patterns);
    };

    const togglePattern = (pattern) => {
        if (isCompleted) return;
        const newPatterns = patterns.includes(pattern)
            ? patterns.filter(p => p !== pattern)
            : [...patterns, pattern];
        setPatterns(newPatterns);
        saveData(reflection, newPatterns);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    day: dayId,
                    userText: reflection,
                    mode: dayId === 14 ? 'synthesis' : 'mirror'
                })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setLlmResponse(data.text);
                const newCount = generationCount + 1;
                setGenerationCount(newCount);
                saveData(reflection, patterns, isCompleted, data.text, newCount);
            }
        } catch (err) {
            setError('Could not connect to the Mirifer server. Ensure it is running on port 3001.');
        } finally {
            setIsLoading(false);
        }
    };

    const closeDay = () => {
        if (window.confirm("Are you sure? Once closed, you cannot edit this entry. Today is complete.")) {
            setIsCompleted(true);
            saveData(reflection, patterns, true);
        }
    };

    if (!dayData) return <div className="container">Day not found.</div>;

    return (
        <div className="container day-page">
            <nav className="breadcrumb">
                <Link to="/">Mirifer</Link> / Day {dayId}
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

            <section className="pattern-check-section notion-block">
                <h3>Pattern Check (Optional)</h3>
                <div className="pattern-grid">
                    {PATTERN_OPTIONS.map(pattern => (
                        <label key={pattern} className={`pattern-item ${patterns.includes(pattern) ? 'checked' : ''}`}>
                            <input
                                type="checkbox"
                                checked={patterns.includes(pattern)}
                                onChange={() => togglePattern(pattern)}
                                disabled={isCompleted}
                            />
                            <span className="checkbox-custom"></span>
                            {pattern}
                        </label>
                    ))}
                </div>
            </section>

            <section className="mirifer-reflection-section notion-block">
                <h3>Mirifer's Reflection</h3>
                {llmResponse ? (
                    <div className="reflection-output">
                        <div className="llm-text">{llmResponse}</div>
                        {!isCompleted && generationCount < 2 && (
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
