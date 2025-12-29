import { useState } from 'react';
import NotionButton from '../NotionButton/NotionButton';
import './SharePostcard.css';

function SharePostcard({ day, aiText }) {
    const [postcardUrl, setPostcardUrl] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const extractQuote = (text) => {
        // Extract most powerful sentence (first sentence usually)
        const sentences = text.split('. ');
        const firstSentence = sentences[0];
        return firstSentence.length > 150
            ? firstSentence.substring(0, 147) + '...'
            : firstSentence + '.';
    };

    const generatePostcard = async () => {
        setGenerating(true);
        setError(null);

        try {
            const quote = extractQuote(aiText);
            const accessCode = localStorage.getItem('mirifer_access_code');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/mirifer/generate-postcard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Code': accessCode
                },
                body: JSON.stringify({ day, quote })
            });

            if (!response.ok) {
                throw new Error('Failed to generate postcard');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPostcardUrl(url);
        } catch (err) {
            console.error('Postcard error:', err);
            setError('Could not generate postcard. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const shareToSocial = async () => {
        if (navigator.share) {
            try {
                // Convert blob URL to file for sharing
                const response = await fetch(postcardUrl);
                const blob = await response.blob();
                const file = new File([blob], `mirifer-day${day}-insight.png`, { type: 'image/png' });

                await navigator.share({
                    title: 'My Mirifer Reflection',
                    text: `Check out my reflection from Day ${day} of my Mirifer journey`,
                    files: [file]
                });
            } catch (err) {
                console.error('Share error:', err);
                // Fallback: download the image
                downloadPostcard();
            }
        } else {
            // Fallback: download the image
            downloadPostcard();
        }
    };

    const downloadPostcard = () => {
        const a = document.createElement('a');
        a.href = postcardUrl;
        a.download = `mirifer-day${day}-insight.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="share-postcard">
            {!postcardUrl ? (
                <NotionButton
                    onClick={generatePostcard}
                    disabled={generating}
                    type="secondary"
                >
                    {generating ? '✨ Creating...' : '📸 Create Insight Card'}
                </NotionButton>
            ) : (
                <div className="postcard-preview">
                    <img src={postcardUrl} alt="Insight Postcard" className="postcard-image" />
                    <div className="postcard-actions">
                        <NotionButton onClick={shareToSocial}>
                            📤 Share
                        </NotionButton>
                        <NotionButton onClick={downloadPostcard} type="secondary">
                            💾 Download
                        </NotionButton>
                    </div>
                </div>
            )}
            {error && <p className="postcard-error">{error}</p>}
        </div>
    );
}

export default SharePostcard;
