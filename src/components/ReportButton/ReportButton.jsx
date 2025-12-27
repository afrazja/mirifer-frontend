import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotionButton from '../NotionButton/NotionButton';
import './ReportButton.css';

const ReportButton = () => {
    const { getAccessCode } = useAuth();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading7, setDownloading7] = useState(false);
    const [downloading14, setDownloading14] = useState(false);
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

    const handleDownloadReport = async (reportType) => {
        const accessCode = getAccessCode();
        if (!accessCode) return;

        const setDownloading = reportType === '7' ? setDownloading7 : setDownloading14;
        setDownloading(true);
        setError('');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const endpoint = reportType === '7' ? '/api/mirifer/report-7.pdf' : '/api/mirifer/report.pdf';

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
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
            a.download = reportType === '7' ? 'mirifer-7day-report.pdf' : 'mirifer-14day-report.pdf';
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
        return null;
    }

    const completedDays = progress?.completedDays?.length || 0;
    const has7Days = completedDays >= 7;
    const has14Days = completedDays >= 14;

    // Don't show anything if less than 7 days
    if (completedDays < 7) {
        return null;
    }

    return (
        <div className="report-button-container">
            {has7Days && (
                <NotionButton
                    type="secondary"
                    onClick={() => handleDownloadReport('7')}
                    disabled={downloading7}
                    className="report-button"
                >
                    {downloading7 ? 'Generating...' : 'Generate 7-Day Report'}
                </NotionButton>
            )}

            {has14Days && (
                <NotionButton
                    type="secondary"
                    onClick={() => handleDownloadReport('14')}
                    disabled={downloading14}
                    className="report-button"
                    style={{ marginLeft: has7Days ? '1rem' : '0' }}
                >
                    {downloading14 ? 'Generating...' : 'Generate 14-Day Report'}
                </NotionButton>
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
