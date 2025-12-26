import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotionButton from '../NotionButton/NotionButton';
import './OnboardingModal.css';

const OnboardingModal = ({ onClose }) => {
    const navigate = useNavigate();

    const handleStartJourney = () => {
        onClose();
        // User stays on home page to see journey table
    };

    return (
        <div className="onboarding-overlay" onClick={onClose}>
            <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>

                <div className="onboarding-content">
                    <h1>Welcome to Mirifer</h1>
                    <p className="subtitle">Your 14-day uncertainty reduction journey</p>

                    <div className="onboarding-steps">
                        <div className="step">
                            <div className="step-icon">📝</div>
                            <h3>Daily Reflection</h3>
                            <p>Answer one focused question each day (10-15 minutes)</p>
                        </div>

                        <div className="step">
                            <div className="step-icon">🪞</div>
                            <h3>Mirifer's Response</h3>
                            <p>Receive a mirrored reflection of your thoughts</p>
                        </div>

                        <div className="step">
                            <div className="step-icon">✅</div>
                            <h3>Close & Move On</h3>
                            <p>When today's step is done, you stop. No optimization needed.</p>
                        </div>
                    </div>

                    <div className="onboarding-principles">
                        <p><strong>Core principles:</strong></p>
                        <ul>
                            <li>Each day takes 10–15 minutes</li>
                            <li>There is nothing to optimize</li>
                            <li>When today's step is done, you stop</li>
                        </ul>
                    </div>

                    <div className="onboarding-actions">
                        <NotionButton type="primary" onClick={handleStartJourney}>
                            Start Day 1
                        </NotionButton>
                        <button className="skip-link" onClick={onClose}>
                            I'll explore on my own
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
