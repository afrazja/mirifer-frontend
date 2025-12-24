import React, { useState } from 'react';
import './Toggle.css';

const Toggle = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`notion-toggle ${isOpen ? 'is-open' : ''}`}>
            <div className="notion-toggle-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="notion-toggle-arrow">
                    {isOpen ? '▼' : '▶'}
                </span>
                <span className="notion-toggle-title">{title}</span>
            </div>
            {isOpen && (
                <div className="notion-toggle-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Toggle;
