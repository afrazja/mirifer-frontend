import React from 'react';
import './NotionButton.css';

const NotionButton = ({ children, onClick, icon, type = 'primary' }) => {
    return (
        <button className={`notion-button button-${type}`} onClick={onClick}>
            {icon && <span className="notion-button-icon">{icon}</span>}
            <span className="notion-button-text">{children}</span>
        </button>
    );
};

export default NotionButton;
