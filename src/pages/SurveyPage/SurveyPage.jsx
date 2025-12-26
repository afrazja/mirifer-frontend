import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotionButton from '../../components/NotionButton/NotionButton';
import './SurveyPage.css';

const SurveyPage = () => {
    const navigate = useNavigate();
    const { getAccessCode } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        thought_change: '',
        what_changed: '',
        question_stayed: null,
        which_question: '',
        felt_resistance: '',
        resistance_type: '',
        experience_statement: '',
        least_useful_period: '',
        least_useful_explanation: '',
        would_miss: null,
        why_miss: '',
        not_work_for: '',
        who_for: '',
        length_feeling: '',
        length_why: '',
        expected_next: '',
        definition: ''
    });

    useEffect(() => {
        checkSurveyStatus();
    }, []);

    const checkSurveyStatus = async () => {
        const accessCode = getAccessCode();
        if (!accessCode) {
            navigate('/login');
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        try {
            const response = await fetch(`${apiUrl}/api/mirifer/survey/status`, {
                headers: { 'X-Access-Code': accessCode }
            });
            const data = await response.json();
            if (data.submitted) {
                setSubmitted(true);
            }
        } catch (err) {
            console.error('Failed to check survey status:', err);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const accessCode = getAccessCode();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/api/mirifer/survey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Code': accessCode
                },
                body: JSON.stringify(formData)
            });

            if (response.status === 409) {
                setError('You have already submitted this survey.');
                setSubmitted(true);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to submit survey');
            }

            setSubmitted(true);
        } catch (err) {
            console.error('Survey submission error:', err);
            setError('Failed to submit survey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container survey-page">
                <div className="survey-complete">
                    <h1>Thank you</h1>
                    <p>Your reflection has been recorded.</p>
                    <p className="instruction">There is nothing else to do.</p>
                    <NotionButton onClick={() => navigate('/')}>
                        Return Home
                    </NotionButton>
                </div>
            </div>
        );
    }

    return (
        <div className="container survey-page">
            <header className="survey-header">
                <h1>Mirifer — Trial User Reflection</h1>
                <div className="survey-instruction">
                    <p><strong>This is not a product feedback form.</strong></p>
                    <p>There are no right answers.</p>
                    <p>Short, honest responses are more valuable than thoughtful ones.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="survey-form">
                {/* Section 1: Experience */}
                <section className="survey-section">
                    <h2>Section 1 — Experience</h2>

                    <div className="question">
                        <label>1. During the 14 days, did Mirifer change anything about how you thought?</label>
                        <div className="radio-group">
                            {['Yes, noticeably', 'Slightly', 'Not really', 'No change at all'].map(option => (
                                <label key={option} className="radio-option">
                                    <input
                                        type="radio"
                                        name="thought_change"
                                        value={option}
                                        checked={formData.thought_change === option}
                                        onChange={(e) => handleChange('thought_change', e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="question">
                        <label>2. If something changed, what changed?</label>
                        <p className="hint">One or two sentences is enough.</p>
                        <textarea
                            value={formData.what_changed}
                            onChange={(e) => handleChange('what_changed', e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="question">
                        <label>3. Did any question stay with you after the day you saw it?</label>
                        <div className="radio-group">
                            {[{ label: 'Yes', value: true }, { label: 'No', value: false }, { label: "I'm not sure", value: null }].map(option => (
                                <label key={option.label} className="radio-option">
                                    <input
                                        type="radio"
                                        name="question_stayed"
                                        checked={formData.question_stayed === option.value}
                                        onChange={() => handleChange('question_stayed', option.value)}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                        {formData.question_stayed === true && (
                            <div className="conditional-field">
                                <label>If yes, which one — and why?</label>
                                <textarea
                                    value={formData.which_question}
                                    onChange={(e) => handleChange('which_question', e.target.value)}
                                    rows="3"
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 2: Fit & Friction */}
                <section className="survey-section">
                    <h2>Section 2 — Fit & Friction</h2>

                    <div className="question">
                        <label>4. At any point, did you feel resistance to opening Mirifer?</label>
                        <div className="radio-group">
                            {['No', 'Occasionally', 'Often'].map(option => (
                                <label key={option} className="radio-option">
                                    <input
                                        type="radio"
                                        name="felt_resistance"
                                        value={option}
                                        checked={formData.felt_resistance === option}
                                        onChange={(e) => handleChange('felt_resistance', e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        {(formData.felt_resistance === 'Occasionally' || formData.felt_resistance === 'Often') && (
                            <div className="conditional-field">
                                <label>If yes, what kind of resistance was it?</label>
                                <textarea
                                    value={formData.resistance_type}
                                    onChange={(e) => handleChange('resistance_type', e.target.value)}
                                    rows="3"
                                />
                            </div>
                        )}
                    </div>

                    <div className="question">
                        <label>5. Which statement feels closest to your experience?</label>
                        <div className="radio-group">
                            {[
                                'It reduced mental noise',
                                'It clarified something specific',
                                'It surfaced discomfort without resolution',
                                'It felt neutral',
                                'It felt unnecessary'
                            ].map(option => (
                                <label key={option} className="radio-option">
                                    <input
                                        type="radio"
                                        name="experience_statement"
                                        value={option}
                                        checked={formData.experience_statement === option}
                                        onChange={(e) => handleChange('experience_statement', e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="question">
                        <label>6. When did Mirifer feel least useful?</label>
                        <div className="radio-group">
                            {['Early days (1–3)', 'Middle (4–10)', 'End (11–14)', 'Never', 'Always'].map(option => (
                                <label key={option} className="radio-option">
                                    <input
                                        type="radio"
                                        name="least_useful_period"
                                        value={option}
                                        checked={formData.least_useful_period === option}
                                        onChange={(e) => handleChange('least_useful_period', e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        <div className="conditional-field">
                            <label>Optional explanation:</label>
                            <textarea
                                value={formData.least_useful_explanation}
                                onChange={(e) => handleChange('least_useful_explanation', e.target.value)}
                                rows="2"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: Meaning */}
                <section className="survey-section">
                    <h2>Section 3 — Meaning</h2>

                    <div className="question">
                        <label>7. If Mirifer disappeared tomorrow, would you miss it?</label>
                        <div className="radio-group">
                            {[{ label: 'Yes', value: true }, { label: 'No', value: false }, { label: 'Unsure', value: null }].map(option => (
                                <label key={option.label} className="radio-option">
                                    <input
                                        type="radio"
                                        name="would_miss"
                                        checked={formData.would_miss === option.value}
                                        onChange={() => handleChange('would_miss', option.value)}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="conditional-field">
                            <label>Why?</label>
                            <textarea
                                value={formData.why_miss}
                                onChange={(e) => handleChange('why_miss', e.target.value)}
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="question">
                        <label>8. What kind of person would this not work for?</label>
                        <textarea
                            value={formData.not_work_for}
                            onChange={(e) => handleChange('not_work_for', e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="question">
                        <label>9. Who do you think Mirifer is for?</label>
                        <textarea
                            value={formData.who_for}
                            onChange={(e) => handleChange('who_for', e.target.value)}
                            rows="3"
                        />
                    </div>
                </section>

                {/* Section 4: Direction */}
                <section className="survey-section">
                    <h2>Section 4 — Direction</h2>

                    <div className="question">
                        <label>10. Did the 14-day length feel:</label>
                        <div className="radio-group">
                            {['Too short', 'Right', 'Too long'].map(option => (
                                <label key={option} className="radio-option">
                                    <input
                                        type="radio"
                                        name="length_feeling"
                                        value={option}
                                        checked={formData.length_feeling === option}
                                        onChange={(e) => handleChange('length_feeling', e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        <div className="conditional-field">
                            <label>Why?</label>
                            <textarea
                                value={formData.length_why}
                                onChange={(e) => handleChange('length_why', e.target.value)}
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className="question">
                        <label>11. After 14 days, what did you expect to happen next?</label>
                        <div className="radio-group">
                            {[
                                'Nothing — it felt complete',
                                'Another cycle',
                                'Guidance or synthesis',
                                "I wasn't sure"
                            ].map(option => (
                                <label key={option} className="radio-option">
                                    <input
                                        type="radio"
                                        name="expected_next"
                                        value={option}
                                        checked={formData.expected_next === option}
                                        onChange={(e) => handleChange('expected_next', e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final Question */}
                <section className="survey-section final-section">
                    <h2>Final Question — The One That Matters Most</h2>

                    <div className="question">
                        <label>12. In one sentence, what is Mirifer to you?</label>
                        <textarea
                            value={formData.definition}
                            onChange={(e) => handleChange('definition', e.target.value)}
                            rows="2"
                            placeholder="One sentence..."
                        />
                    </div>
                </section>

                {error && <p className="error-message">{error}</p>}

                <div className="submit-section">
                    <NotionButton type="primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Reflection'}
                    </NotionButton>
                </div>
            </form>
        </div>
    );
};

export default SurveyPage;
