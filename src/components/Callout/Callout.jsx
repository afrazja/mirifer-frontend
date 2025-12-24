import React from 'react';
import './Callout.css';

const Callout = ({ children, icon = '💡', type = 'default' }) => {
  return (
    <div className={`notion-callout callout-${type}`}>
      <div className="notion-callout-icon">{icon}</div>
      <div className="notion-callout-content">{children}</div>
    </div>
  );
};

export default Callout;
