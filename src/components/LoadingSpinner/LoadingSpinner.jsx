import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', showEstimate = false }) => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <div className="loading-text">
                {message}
                {showEstimate && (
                    <span className="time-estimate">~30 seconds</span>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
