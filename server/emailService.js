const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send email notification when survey is submitted
 * @param {Object} surveyData - Survey response data
 * @param {string} accessCode - User's access code
 */
async function sendSurveyNotification(surveyData, accessCode) {
    if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) {
        console.warn('Email notifications not configured. Skipping email send.');
        return { success: false, reason: 'not_configured' };
    }

    try {
        const emailHtml = formatSurveyEmail(surveyData, accessCode);

        const { data, error } = await resend.emails.send({
            from: 'Mirifer <onboarding@resend.dev>',
            to: [process.env.NOTIFICATION_EMAIL],
            subject: `New Mirifer Survey Response - ${accessCode}`,
            html: emailHtml
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }

        console.log('Survey notification sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send survey notification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Format survey data into readable HTML email
 */
function formatSurveyEmail(data, accessCode) {
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f7f6f3; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #2c3e50; }
        .question { margin-bottom: 15px; }
        .question-label { font-weight: 500; color: #555; margin-bottom: 5px; }
        .answer { background: #f9f9f9; padding: 10px; border-left: 3px solid #3498db; margin-top: 5px; }
        .key-insight { background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">New Mirifer Survey Response</h2>
            <p style="margin: 5px 0 0 0; color: #666;">
                <strong>User:</strong> ${accessCode}<br>
                <strong>Submitted:</strong> ${timestamp}
            </p>
        </div>

        <div class="key-insight">
            <h3 style="margin-top: 0;">Key Insights</h3>
            <p><strong>Thought change:</strong> ${data.thought_change || 'Not answered'}</p>
            <p><strong>Would miss it:</strong> ${data.would_miss ? 'Yes' : data.would_miss === false ? 'No' : 'Unsure'}</p>
            <p><strong>Definition:</strong> "${data.definition || 'Not provided'}"</p>
        </div>

        <div class="section">
            <div class="section-title">Section 1: Experience</div>
            
            <div class="question">
                <div class="question-label">Did Mirifer change how you thought?</div>
                <div class="answer">${data.thought_change || 'Not answered'}</div>
            </div>

            ${data.what_changed ? `
            <div class="question">
                <div class="question-label">What changed?</div>
                <div class="answer">${data.what_changed}</div>
            </div>
            ` : ''}

            ${data.which_question ? `
            <div class="question">
                <div class="question-label">Which question stayed with you?</div>
                <div class="answer">${data.which_question}</div>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Section 2: Fit & Friction</div>
            
            <div class="question">
                <div class="question-label">Felt resistance?</div>
                <div class="answer">${data.felt_resistance || 'Not answered'}</div>
            </div>

            ${data.resistance_type ? `
            <div class="question">
                <div class="question-label">Type of resistance:</div>
                <div class="answer">${data.resistance_type}</div>
            </div>
            ` : ''}

            <div class="question">
                <div class="question-label">Experience statement:</div>
                <div class="answer">${data.experience_statement || 'Not answered'}</div>
            </div>

            <div class="question">
                <div class="question-label">Least useful period:</div>
                <div class="answer">${data.least_useful_period || 'Not answered'}</div>
            </div>

            ${data.least_useful_explanation ? `
            <div class="question">
                <div class="question-label">Explanation:</div>
                <div class="answer">${data.least_useful_explanation}</div>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Section 3: Meaning</div>
            
            ${data.why_miss ? `
            <div class="question">
                <div class="question-label">Why would/wouldn't miss it:</div>
                <div class="answer">${data.why_miss}</div>
            </div>
            ` : ''}

            ${data.not_work_for ? `
            <div class="question">
                <div class="question-label">What kind of person would this NOT work for?</div>
                <div class="answer">${data.not_work_for}</div>
            </div>
            ` : ''}

            ${data.who_for ? `
            <div class="question">
                <div class="question-label">Who is Mirifer for?</div>
                <div class="answer">${data.who_for}</div>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Section 4: Direction</div>
            
            <div class="question">
                <div class="question-label">14-day length felt:</div>
                <div class="answer">${data.length_feeling || 'Not answered'}</div>
            </div>

            ${data.length_why ? `
            <div class="question">
                <div class="question-label">Why:</div>
                <div class="answer">${data.length_why}</div>
            </div>
            ` : ''}

            <div class="question">
                <div class="question-label">Expected next:</div>
                <div class="answer">${data.expected_next || 'Not answered'}</div>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from Mirifer. Responses are stored in your Supabase database.</p>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = { sendSurveyNotification };
