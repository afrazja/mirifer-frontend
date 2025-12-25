import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MIRIFER_DAYS } from '../../data/days';
import { useAuth } from '../../context/AuthContext';
import './Journey.css';

const Journey = () => {
    const navigate = useNavigate();
    const { getAccessCode } = useAuth();
    const [journeyState, setJourneyState] = useState({});

    useEffect(() => {
        const loadJourneyState = async () => {
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
                    console.log('Loaded entries:', data.entries);
                    // Build journey state from entries
                    const state = {};
                    data.entries.forEach(entry => {
                        if (entry.is_completed) {
                            state[entry.day] = 'Complete';
                        } else if (entry.user_text && entry.user_text.trim().length > 0) {
                            state[entry.day] = 'In progress';
                        }
                    });
                    setJourneyState(state);
                }
            } catch (err) {
                console.error('Failed to load journey state:', err);
                // Fallback to local
                const savedJourney = JSON.parse(localStorage.getItem('mirifer_journey') || '{}');
                setJourneyState(savedJourney);
            }
        };

        loadJourneyState();
    }, [getAccessCode]);

    const getStatus = (dayId) => {
        return journeyState[dayId] || 'Not started';
    };

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(' ', '-');
    };

    return (
        <div className="journey-database">
            <h3 className="notion-block">Mirifer Journey</h3>
            <div className="database-table">
                <div className="table-header">
                    <div className="col-day">Day</div>
                    <div className="col-title">Title</div>
                    <div className="col-status">Status</div>
                </div>
                <div className="table-body">
                    {MIRIFER_DAYS.map((day) => (
                        <div
                            key={day.day}
                            className="table-row"
                            onClick={() => navigate(`/day/${day.day}`)}
                        >
                            <div className="col-day">{day.day}</div>
                            <div className="col-title">{day.title}</div>
                            <div className="col-status">
                                <span className={`status-pill ${getStatusClass(getStatus(day.day))}`}>
                                    {getStatus(day.day)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Journey;
