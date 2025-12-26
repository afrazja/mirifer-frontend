import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MIRIFER_DAYS } from '../../data/days';
import { useAuth } from '../../context/AuthContext';
import NotionButton from '../NotionButton/NotionButton';
import ReportButton from '../ReportButton/ReportButton';
import './Journey.css';

const Journey = () => {
    const navigate = useNavigate();
    const { getAccessCode, user } = useAuth();
    const [journeyState, setJourneyState] = useState({});

    const handleDeleteData = async (e) => {
        e.stopPropagation();
        const confirm1 = window.confirm("SECURITY & PRIVACY: Are you absolutely sure you want to permanently erase your reflection content? Your progress (completed days) will be kept, but your private thoughts and Mirifer's responses will be permanently removed from our database.");
        if (!confirm1) return;

        const confirm2 = window.confirm("FINAL WARNING: This cannot be undone. All your text entries will be wiped. Continue?");
        if (!confirm2) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/mirifer/data`, {
                method: 'DELETE',
                headers: {
                    'X-Access-Code': user?.accessCode || sessionStorage.getItem('mirifer_access_code')
                }
            });

            if (response.ok) {
                alert("Your reflection content has been successfully erased.");
                // Remove day-specific data but KEEP auth keys
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('mirifer_day_')) {
                        localStorage.removeItem(key);
                    }
                });
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

    useEffect(() => {
        const loadJourneyState = async () => {
            const accessCode = getAccessCode();
            if (!accessCode) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            try {
                const response = await fetch(`${apiUrl}/api/mirifer/entries?t=${Date.now()}`, {
                    headers: {
                        'X-Access-Code': accessCode,
                        'Content-Type': 'application/json'
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
            <div className="journey-footer">
                <ReportButton />
                <button
                    className="delete-data-btn-bottom"
                    onClick={handleDeleteData}
                    title="Delete all reflection content"
                >
                    Delete My Data
                </button>
            </div>
        </div>
    );
};

export default Journey;
