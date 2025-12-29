const { createCanvas, registerFont } = require('canvas');

/**
 * Generate a shareable insight postcard (PNG)
 * @param {string} quote - The quote to display
 * @param {number} day - Day number
 * @returns {Buffer} - PNG image buffer
 */
function generateInsightPostcard(quote, day) {
    // Create canvas (1080x1080 for Instagram)
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Add subtle pattern/texture (optional)
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = 'white';
        ctx.fillRect(Math.random() * 1080, Math.random() * 1080, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Quote text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text
    const maxWidth = 900;
    const lineHeight = 70;
    const lines = wrapText(ctx, quote, maxWidth);
    const startY = 540 - (lines.length * lineHeight) / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, 540, startY + (i * lineHeight));
    });

    // Attribution
    ctx.font = '36px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`— Day ${day}, Mirifer Journey`, 540, 850);

    // Watermark
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('mirifer.com', 540, 1000);

    // Convert to PNG
    return canvas.toBuffer('image/png');
}

/**
 * Wrap text to fit within maxWidth
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }

    return lines;
}

module.exports = { generateInsightPostcard };
