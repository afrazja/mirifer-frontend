import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Callout from '../../components/Callout/Callout';
import Divider from '../../components/Divider/Divider';
import './FinalDirection.css';

const FinalDirection = () => {
    const [direction, setDirection] = useState({
        tension: '',
        directionA: '',
        directionB: '',
        chosenTest: ''
    });

    useEffect(() => {
        const saved = localStorage.getItem('mirifer_direction');
        if (saved) setDirection(JSON.parse(saved));
    }, []);

    const handleChange = (field, value) => {
        const newVal = { ...direction, [field]: value };
        setDirection(newVal);
        localStorage.setItem('mirifer_direction', JSON.stringify(newVal));
    };

    return (
        <div className="container final-direction">
            <nav className="breadcrumb">
                <Link to="/">Mirifer</Link> / Your Direction
            </nav>

            <header className="notion-block">
                <h1>Your Direction</h1>
            </header>

            <section className="core-tension notion-block">
                <h2>Section 1: Core Tension</h2>
                <p className="instruction">Paste 1–2 lines from your AI synthesis here.</p>
                <textarea
                    className="direction-input"
                    value={direction.tension}
                    onChange={(e) => handleChange('tension', e.target.value)}
                    placeholder="What is the central tension..."
                />
            </section>

            <section className="constrained-directions notion-block">
                <h2>Section 2: Constrained Directions</h2>
                <div className="direction-list">
                    <div className="direction-item">
                        <span className="bullet">•</span>
                        <input
                            type="text"
                            className="inline-input"
                            value={direction.directionA}
                            onChange={(e) => handleChange('directionA', e.target.value)}
                            placeholder="Direction A"
                        />
                    </div>
                    <div className="direction-item">
                        <span className="bullet">•</span>
                        <input
                            type="text"
                            className="inline-input"
                            value={direction.directionB}
                            onChange={(e) => handleChange('directionB', e.target.value)}
                            placeholder="Direction B (optional)"
                        />
                    </div>
                </div>
            </section>

            <section className="chosen-test notion-block">
                <h2>Section 3: Chosen Test Direction</h2>
                <p><strong>The direction I will test is:</strong></p>
                <textarea
                    className="direction-input short"
                    value={direction.chosenTest}
                    onChange={(e) => handleChange('chosenTest', e.target.value)}
                    placeholder="Write ONE sentence."
                />
            </section>

            <Divider />

            <section className="closure notion-block">
                <Callout icon="🔒" type="info">
                    <strong>Mirifer is complete.</strong>
                    <p>This is a direction to test — not a life to solve.</p>
                </Callout>
            </section>
        </div>
    );
};

export default FinalDirection;
