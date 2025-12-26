import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ completedDays, totalDays = 14 }) => {
    const percentage = (completedDays / totalDays) * 100;

    return (
        <div className="progress-bar-container">
            <div className="progress-bar-header">
                <span className="progress-label">Journey Progress</span>
                <span className="progress-stats">{completedDays} of {totalDays} days</span>
            </div>
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                >
                    {percentage > 10 && (
                        <span className="progress-percentage">{Math.round(percentage)}%</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
