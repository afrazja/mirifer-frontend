import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotionButton from '../NotionButton/NotionButton';
import './ReportButton.css';

const ReportButton = () => {
    const { getAccessCode } = useAuth();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        const accessCode = getAccessCode();
        if (!accessCode) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/api/mirifer/progress`, {
                headers: {
                    'X-Access-Code': accessCode
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProgress(data);
            } else {
                console.error('Failed to fetch progress');
            }
        } catch (err) {
            console.error('Progress fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        const accessCode = getAccessCode();
        if (!accessCode) return;

        setDownloading(true);
        setError('');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/api/mirifer/report.pdf`, {
                headers: {
                    'X-Access-Code': accessCode
                }
            });

            if (response.status === 409) {
                const errorData = await response.json();
                setError(errorData.message || 'Report unavailable: your journey data is incomplete.');
                setDownloading(false);
                return;
            }

            if (!response.ok) {
                setError('Failed to generate report. Please try again.');
                setDownloading(false);
                return;
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mirifer-report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error('Download error:', err);
            setError('Could not connect to the server. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return null; // Don't show button while loading
    }

    const isEnabled = progress?.hasCompleteData;
    const buttonText = downloading ? 'Generating PDF...' : 'Generate Mirifer Report (PDF)';

    return (
        <div className="report-button-container">
            <NotionButton
                type="primary"
                onClick={handleDownloadReport}
                disabled={!isEnabled || downloading}
                className="report-button"
            >
                {buttonText}
            </NotionButton>
            {!isEnabled && (
                <p className="report-message">
                    Report unavailable: your journey data is incomplete.
                </p>
            )}
            {error && (
                <p className="report-error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default ReportButton;
