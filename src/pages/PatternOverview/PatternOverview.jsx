import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Divider from '../../components/Divider/Divider';
import './PatternOverview.css';

const PatternOverview = () => {
    const [totalPatterns, setTotalPatterns] = useState({});
    const [reflections, setReflections] = useState([]);

    useEffect(() => {
        const patternsCount = {};
        const texts = [];

        for (let i = 1; i <= 14; i++) {
            const dayData = JSON.parse(localStorage.getItem(`mirifer_day_${i}`) || '{}');
            if (dayData.patterns) {
                dayData.patterns.forEach(p => {
                    patternsCount[p] = (patternsCount[p] || 0) + 1;
                });
            }
            if (dayData.reflection) {
                texts.push({ day: i, text: dayData.reflection });
            }
        }

        setTotalPatterns(patternsCount);
        setReflections(texts);
    }, []);

    return (
        <div className="container pattern-overview">
            <nav className="breadcrumb">
                <Link to="/">Mirifer</Link> / Pattern Overview
            </nav>

            <header className="notion-block">
                <h1>Patterns You’ve Noticed</h1>
                <p className="instruction">This page makes the system feel intelligent and reinforces your synthesis.</p>
            </header>

            <section className="patterns-summary notion-block">
                <h2>Emotional Themes</h2>
                {Object.keys(totalPatterns).length > 0 ? (
                    <div className="pattern-tags">
                        {Object.entries(totalPatterns).map(([pattern, count]) => (
                            <div key={pattern} className="pattern-tag">
                                <span className="tag-name">{pattern}</span>
                                <span className="tag-count">{count}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="secondary-text">No patterns noticed yet. Continue your daily reflections.</p>
                )}
            </section>

            <section className="repeating-tensions notion-block">
                <h2>Repeating Tensions</h2>
                <div className="tensions-content">
                    <p className="instruction"><em>"Things that kept appearing..."</em></p>
                    <textarea
                        className="manual-synthesis"
                        placeholder="Write your observations about repeating themes here..."
                        defaultValue={localStorage.getItem('mirifer_tensions') || ''}
                        onChange={(e) => localStorage.setItem('mirifer_tensions', e.target.value)}
                    />
                </div>
            </section>

            <section className="drains-energizes notion-block">
                <h2>What Drains vs Energizes</h2>
                <div className="comparison-grid">
                    <div className="comparison-col">
                        <h3>Drains</h3>
                        <textarea
                            className="comparison-input"
                            placeholder="e.g., Overthinking..."
                            defaultValue={localStorage.getItem('mirifer_drains') || ''}
                            onChange={(e) => localStorage.setItem('mirifer_drains', e.target.value)}
                        />
                    </div>
                    <div className="comparison-col">
                        <h3>Energizes</h3>
                        <textarea
                            className="comparison-input"
                            placeholder="e.g., Taking action..."
                            defaultValue={localStorage.getItem('mirifer_energizes') || ''}
                            onChange={(e) => localStorage.setItem('mirifer_energizes', e.target.value)}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PatternOverview;
