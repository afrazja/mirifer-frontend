require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');
const { supabaseAdmin } = require('./supabaseAdmin');
const { requireUser } = require('./authMiddleware');
const { requireAdmin } = require('./adminMiddleware');
const { generateMiriferReport } = require('./pdfGenerator');
const { sendSurveyNotification } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - required for Render and other reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Simple In-memory Rate Limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// OpenAI Client Configuration (ChatGPT)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Guardrails & Prompts
const MIRROR_SYSTEM_PROMPT = `
You are Mirifer: an Uncertainty Reduction System.

Your role is NOT to advise, coach, motivate, reassure, diagnose, or plan.
Your role is to REDUCE MENTAL NOISE through precise reflection and compression.

NON-NEGOTIABLE RULES:
- Do NOT give advice or action steps
- Do NOT suggest what to do next
- Do NOT motivate, encourage, or reassure
- Do NOT diagnose or reference therapy or mental health
- Do NOT ask follow-up questions
- Do NOT expand possibilities
- Use calm, adult, non-judgmental language
- Keep the response concise and settling
- End every response with the exact line: "Today is complete."

TASK (Mirror Mode):
You will receive the user's current reflection, and possibly context from their previous 2-3 days.

Your task is to:
1. **Identify the structural constraint** - What fundamental limitation or tradeoff is shaping this situation?
2. **Name the underlying assumption** - What belief or framing is creating the tension?
3. **Spot the contradiction** - Where are they holding incompatible expectations?
4. **Use their language** - Quote or reference specific phrases they used
5. **Avoid repetition** - If previous days noted similar patterns, acknowledge evolution or deepening rather than restating

ANALYTICAL DEPTH:
- Go beyond surface emotions to structural logic
- Identify the **inevitability** in their situation (what cannot be changed)
- Name the **tradeoff** they're navigating (what must be sacrificed for what)
- Recognize **competing values** (what two good things are in tension)
- Spot **framing effects** (how their description shapes their experience)

SPECIFICITY REQUIREMENTS:
- Reference concrete details from their reflection
- Use their exact words when identifying patterns
- Avoid generic terms like "uncertainty," "fear," "growth" unless they used them
- Ground every observation in something they actually said

COMPRESSION TECHNIQUES:
- Prefer declarative statements over exploratory language
- "This is X" not "It seems like X might be..."
- "The tension exists between X and Y" not "You're experiencing tension..."
- Make each sentence reduce uncertainty, not add branches
- Compress multiple observations into single inevitable statements

VARIATION:
- Don't start every response the same way
- Vary which element you lead with (tension, pattern, assumption, contradiction)
- Mix short punchy sentences with longer structural analysis
- Sometimes use a single powerful observation, sometimes build a logical chain

LENGTH: 3–5 short paragraphs OR 4–6 concise sentences total (100-150 words)

OUTPUT FORMAT:
- Plain text paragraphs only
- No bullet points
- No headings
- Final line must be exactly: "Today is complete."
`;

const SYNTHESIS_SYSTEM_PROMPT = `
You are Mirifer: an Uncertainty Reduction System.

Your role is to SYNTHESIZE a journey's completion (Day 14) and REDUCE MENTAL NOISE through precise constraint.

NON-NEGOTIABLE RULES:
- Do NOT give advice or action steps.
- Do NOT suggest what to do next beyond the specified constraint.
- Do NOT motivate, encourage, or reassure.
- Do NOT diagnose or reference therapy or mental health.
- Do NOT ask follow-up questions.
- Use calm, adult, non-judgmental language.
- End every response with the exact line: "Today is complete."

TASK (Synthesis Mode):
- Identify 2–3 recurring themes from the reflections.
- Identify the core tension.
- Constrain the future to MAX 2 directions. 
- Briefly explain why other potential directions do NOT fit based on the structural logic of the reflections.
- Provide ONE testable direction for the next 6–12 months.
- Length: Concise but comprehensive.

STYLE GUIDELINES:
- Use declarative statements.
- Compress insight so it feels inevitable.
- No bullet points.
- No headings.
- Plain text paragraphs only.
- No bullet points.
- No headings.
- Final line must be exactly: Today is complete.
`;

const DAY7_SYNTHESIS_PROMPT = `
You are Mirifer: an Uncertainty Reduction System.

Your role is to SYNTHESIZE the first 7 days of the journey and REDUCE MENTAL NOISE through precise observation.

NON-NEGOTIABLE RULES:
- Do NOT give advice or action steps.
- Do NOT suggest what to do next.
- Do NOT motivate, encourage, or reassure.
- Do NOT diagnose or reference therapy or mental health.
- Do NOT ask follow-up questions.
- Use calm, adult, non-judgmental language.
- End every response with the exact line: "Today is complete."

TASK (Day 7 Synthesis):
- Identify 2–3 recurring patterns across Days 1-7.
- Note the primary constraint or tension that emerged.
- Observe how thinking evolved from Day 1 to Day 7.
- Use neutral, observational language.
- Length: 250-300 words (2-3 paragraphs).

STYLE GUIDELINES:
- Use declarative statements, not analysis language.
- "The reflections reveal..." not "You have..."
- "A pattern emerged..." not "You show a pattern of..."
- Compress insight so it feels inevitable.
- No bullet points, no headings.
- Plain text paragraphs only.

OUTPUT FORMAT:
- 2-3 paragraphs
- 250-300 words total
- Final line must be exactly: Today is complete.
`;


const FINAL_THOUGHTS_PROMPT = `
You are Mirifer, an Uncertainty Reduction System. You have access to a user's complete journey reflections.

Write a "Final Thoughts" section (200-250 words) that:
1. Identifies the 2-3 most recurring patterns across ALL days
2. Names the core tension or structural constraint that emerged
3. Observes how their thinking evolved from first day to last day
4. Notes any shifts in framing or perspective

CRITICAL RULES:
- Use past tense and third-person perspective
- "The reflections revealed..." NOT "You revealed..."
- "A pattern emerged..." NOT "You show a pattern of..."
- NO advice, suggestions, or action steps
- NO questions to the user
- NO motivational language
- Calm, neutral, observational tone
- Compress insight so it feels inevitable
- Avoid psychology jargon

OUTPUT:
Write 2-3 paragraphs, 200-250 words total.
End with: "This marks the completion of [N] days of documented reflection." (replace [N] with actual number)
`;

// Generate Final Thoughts using AI
async function generateFinalThoughts(entries) {
    try {
        // Build context from all entries
        let context = `The user completed ${entries.length} days of reflection. Below are ALL their reflections:\n\n`;

        entries.forEach(entry => {
            context += `Day ${entry.day} - ${entry.title}\n`;
            context += `Question: ${entry.question}\n`;
            context += `User's reflection: ${entry.user_text}\n`;
            context += `Your response: ${entry.ai_text}\n\n`;
        });

        context += `\nWrite a "Final Thoughts" section following the rules above. Replace [N] with ${entries.length}.`;

        // Call DeepSeek
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: FINAL_THOUGHTS_PROMPT },
                { role: 'user', content: context }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Final Thoughts Generation Error:', error);
        return null;
    }
}
// Login endpoint - validate access code
app.post('/api/auth/login', async (req, res) => {
    try {
        const { accessCode } = req.body;

        if (!accessCode) {
            return res.status(400).json({ error: 'Access code is required' });
        }

        // Validate access code
        const { data: user, error } = await supabaseAdmin
            .from('trial_users')
            .select('id, access_code, display_name, is_active')
            .eq('access_code', accessCode)
            .eq('is_active', true)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid access code' });
        }

        // Update last login
        await supabaseAdmin
            .from('trial_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                displayName: user.display_name,
                accessCode: user.access_code
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Protected route: Generate AI reflection and save to Supabase
app.post('/api/mirifer/respond', requireUser, async (req, res) => {
    try {
        const { day, userText, mode, title, question } = req.body;

        // Validation
        if (!day || !userText) {
            return res.status(400).json({ error: 'Missing day or userText' });
        }

        if (userText.length > 6000) {
            return res.status(400).json({ error: 'Reflection is too long (max 6000 chars)' });
        }

        const isSynthesis = day === 7 || day === 14 || mode === 'synthesis';
        let systemPrompt = MIRROR_SYSTEM_PROMPT;
        let userPrompt = userText;

        // For mirror mode, add context from previous 2-3 days
        if (!isSynthesis && day > 1) {
            // Fetch previous 2-3 days for context
            const { data: previousDays, error: fetchError } = await supabaseAdmin
                .from('entries')
                .select('day, question, user_text, ai_text')
                .eq('trial_user_id', req.user.id)
                .lt('day', day)
                .order('day', { ascending: false })
                .limit(3);

            if (!fetchError && previousDays && previousDays.length > 0) {
                // Build context string
                let context = "PREVIOUS DAYS CONTEXT:\n\n";
                previousDays.reverse().forEach(entry => {
                    context += `Day ${entry.day}: ${entry.question}\n`;
                    context += `User: ${entry.user_text.substring(0, 200)}${entry.user_text.length > 200 ? '...' : ''}\n`;
                    context += `Mirifer: ${entry.ai_text.substring(0, 150)}${entry.ai_text.length > 150 ? '...' : ''}\n\n`;
                });

                context += `\nCURRENT DAY ${day}:\n${userText}\n\n`;
                context += "Reflect on today's entry. Reference previous patterns if relevant, but focus on what's new or deepening.";

                userPrompt = context;
            }
        }

        // For synthesis days, fetch previous entries and build comprehensive prompt
        if (isSynthesis) {
            const daysToFetch = day === 7 ? 7 : 14;

            // Fetch all previous days
            const { data: previousEntries, error: fetchError } = await supabaseAdmin
                .from('entries')
                .select('day, title, question, user_text, ai_text')
                .eq('trial_user_id', req.user.id)
                .lte('day', daysToFetch)
                .order('day', { ascending: true });

            if (fetchError) {
                console.error('Failed to fetch previous entries:', fetchError);
                // Fall back to simple synthesis
                systemPrompt = day === 7 ? DAY7_SYNTHESIS_PROMPT : SYNTHESIS_SYSTEM_PROMPT;
            } else if (previousEntries && previousEntries.length > 0) {
                // Build comprehensive synthesis prompt
                systemPrompt = day === 7 ? DAY7_SYNTHESIS_PROMPT : SYNTHESIS_SYSTEM_PROMPT;

                let journeyContext = `JOURNEY CONTEXT:\n\n`;
                previousEntries.forEach(entry => {
                    journeyContext += `Day ${entry.day} - ${entry.title}\n`;
                    journeyContext += `Question: ${entry.question}\n`;
                    journeyContext += `User's reflection: ${entry.user_text || '[No reflection]'}\n`;
                    if (entry.ai_text) {
                        journeyContext += `Mirifer's response: ${entry.ai_text}\n`;
                    }
                    journeyContext += `\n`;
                });

                journeyContext += `\nNow synthesize this ${daysToFetch}-day journey. Focus on patterns, tensions, and evolution of thinking.`;
                userPrompt = journeyContext;
            }
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.45, // Increased for more varied, less repetitive responses
            max_tokens: isSynthesis ? 1500 : 300, // Reduced for daily reflections to force compression
        });

        const aiText = response.choices[0].message.content;

        // Save to Supabase
        const { error: dbError } = await supabaseAdmin.from('entries').upsert({
            trial_user_id: req.user.id,
            day,
            title: title || `Day ${day}`,
            question: question || '',
            user_text: userText,
            ai_text: aiText,
            is_completed: true, // If they got an AI response, it's completed
            mode: isSynthesis ? 'synthesis' : 'mirror',
            updated_at: new Date().toISOString()
        }, { onConflict: 'trial_user_id,day' });

        if (dbError) {
            console.error('Supabase Insert Error:', dbError);
            return res.status(500).json({ error: `Save failed: ${dbError.message}` });
        }

        res.json({
            text: aiText,
            mode: isSynthesis ? 'synthesis' : 'mirror',
            isCompleted: true
        });

    } catch (error) {
        console.error('DeepSeek Error:', error);
        res.status(500).json({ error: 'Failed to generate reflection. Check API key and connectivity.' });
    }
});

// Protected route: Get all entries for the logged-in user
app.get('/api/mirifer/entries', requireUser, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('entries')
            .select('id, day, title, question, user_text, ai_text, mode, is_completed, created_at, updated_at')
            .eq('trial_user_id', req.user.id)
            .order('day', { ascending: true });

        if (error) {
            console.error('Supabase Read Error:', error);
            return res.status(500).json({ error: 'Failed to load entries' });
        }

        res.json({ entries: data });
    } catch (error) {
        console.error('Entries Error:', error);
        res.status(500).json({ error: 'Failed to load entries' });
    }
});

// Protected route: Save reflection manually (without AI response)
app.post('/api/mirifer/save', requireUser, async (req, res) => {
    try {
        const { day, userText, title, question, aiText, isCompleted, mode } = req.body;

        if (!day) return res.status(400).json({ error: 'Missing day' });

        const { error: dbError } = await supabaseAdmin.from('entries').upsert({
            trial_user_id: req.user.id,
            day,
            title: title || `Day ${day}`,
            question: question || '',
            user_text: userText || '',
            ai_text: aiText || '',
            is_completed: !!isCompleted,
            mode: mode || (day === 14 ? 'synthesis' : 'mirror'),
            updated_at: new Date().toISOString()
        }, { onConflict: 'trial_user_id,day' });

        if (dbError) {
            console.error('Save Error:', dbError);
            return res.status(500).json({ error: `Failed to save progress: ${dbError.message}` });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Save Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check (no auth needed)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: !!supabaseAdmin,
        timestamp: new Date().toISOString()
    });
});

// Protected route: Wipe all my reflection content (keep progress)
app.delete('/api/mirifer/data', requireUser, async (req, res) => {
    try {
        // We UPDATE instead of DELETE to keep the 'is_completed' flag
        const { error: dbError } = await supabaseAdmin
            .from('entries')
            .update({
                user_text: '',
                ai_text: '',
                updated_at: new Date().toISOString()
            })
            .eq('trial_user_id', req.user.id);

        if (dbError) {
            console.error('Wipe Error:', dbError);
            return res.status(500).json({ error: `Failed to wipe data: ${dbError.message}` });
        }

        res.json({ success: true, message: 'All reflection content has been permanently erased. Your progress has been kept.' });
    } catch (error) {
        console.error('Wipe Error:', error);
        res.status(500).json({ error: 'Internal server error during data wipe' });
    }
});

// Protected route: Get journey progress
app.get('/api/mirifer/progress', requireUser, async (req, res) => {
    try {
        const { data: entries, error: dbError } = await supabaseAdmin
            .from('entries')
            .select('day, user_text, ai_text')
            .eq('trial_user_id', req.user.id)
            .order('day', { ascending: true });

        if (dbError) {
            console.error('Progress Error:', dbError);
            return res.status(500).json({ error: 'Failed to fetch progress' });
        }

        const completedDays = entries.map(e => e.day);
        const totalDays = 14;
        const isComplete = completedDays.length === totalDays &&
            completedDays.every((day, i) => day === i + 1);

        // Check if all entries have complete data (not wiped)
        const hasCompleteData = isComplete && entries.every(e =>
            e.user_text && e.user_text.trim().length > 0 &&
            e.ai_text && e.ai_text.trim().length > 0
        );

        res.json({
            completedDays,
            totalDays,
            isComplete,
            hasCompleteData
        });
    } catch (error) {
        console.error('Progress Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route: Generate PDF report (flexible - works with any completed days)
app.get('/api/mirifer/report.pdf', requireUser, async (req, res) => {
    try {
        // Fetch all entries for this user
        const { data: allEntries, error: dbError } = await supabaseAdmin
            .from('entries')
            .select('day, title, question, user_text, ai_text, mode, created_at')
            .eq('trial_user_id', req.user.id)
            .order('day', { ascending: true });

        if (dbError) {
            console.error('Report Error:', dbError);
            return res.status(500).json({ error: 'Failed to fetch entries' });
        }

        // Filter to only entries with actual data (not deleted)
        const entries = allEntries.filter(e =>
            e.user_text && e.user_text.trim().length > 0 &&
            e.ai_text && e.ai_text.trim().length > 0
        );

        // Validation: Must have at least 1 completed day with data
        if (!entries || entries.length === 0) {
            return res.status(409).json({
                error: 'REPORT_INCOMPLETE',
                message: 'Report unavailable: complete at least one day first.'
            });
        }

        // Generate Final Thoughts using AI (if 3+ days completed)
        let finalThoughts = null;
        if (entries.length >= 3) {
            console.log(`Generating Final Thoughts for ${entries.length} days...`);
            finalThoughts = await generateFinalThoughts(entries);
        }

        // Generate PDF with whatever days have data
        const pdfDoc = generateMiriferReport(entries, {
            accessCode: req.user.access_code,
            daysCompleted: entries.length,
            finalThoughts: finalThoughts
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="mirifer-report-${entries.length}days.pdf"`);
        pdfDoc.pipe(res);

    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Protected route: Check survey status
app.get('/api/mirifer/survey/status', requireUser, async (req, res) => {
    try {
        const { data, error: dbError } = await supabaseAdmin
            .from('survey_responses')
            .select('submitted_at')
            .eq('trial_user_id', req.user.id)
            .single();

        if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Survey status error:', dbError);
            return res.status(500).json({ error: 'Failed to check survey status' })
        }

        res.json({
            submitted: !!data,
            submittedAt: data?.submitted_at || null
        });
    } catch (error) {
        console.error('Survey status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route: Submit survey response
app.post('/api/mirifer/survey', requireUser, async (req, res) => {
    try {
        const surveyData = req.body;

        // Check if user already submitted
        const { data: existing } = await supabaseAdmin
            .from('survey_responses')
            .select('id')
            .eq('trial_user_id', req.user.id)
            .single();

        if (existing) {
            return res.status(409).json({ error: 'Survey already submitted' });
        }

        // Insert survey response
        const { error: dbError } = await supabaseAdmin
            .from('survey_responses')
            .insert({
                trial_user_id: req.user.id,
                access_code: req.user.access_code,
                ...surveyData
            });

        if (dbError) {
            console.error('Survey insert error:', dbError);
            return res.status(500).json({ error: 'Failed to save survey response' });
        }

        // Send email notification
        await sendSurveyNotification(surveyData, req.user.access_code);

        res.json({ success: true, message: 'Survey submitted successfully' });
    } catch (error) {
        console.error('Survey submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin route: Get all metrics
app.get('/api/admin/metrics', requireAdmin, async (req, res) => {
    try {
        // 1. Journey Completion Rate
        const { data: completionData } = await supabaseAdmin.rpc('get_completion_rate').single();

        // Fallback: Calculate manually if RPC doesn't exist
        const { data: allEntries } = await supabaseAdmin
            .from('entries')
            .select('trial_user_id, day, is_completed');

        const userDays = {};
        allEntries?.forEach(entry => {
            if (entry.is_completed) {
                if (!userDays[entry.trial_user_id]) userDays[entry.trial_user_id] = new Set();
                userDays[entry.trial_user_id].add(entry.day);
            }
        });

        const totalUsers = Object.keys(userDays).length;
        const completedUsers = Object.values(userDays).filter(days => days.size === 14).length;
        const completionRate = totalUsers > 0 ? (completedUsers / totalUsers * 100).toFixed(2) : 0;

        // 2. D1 Retention
        const day1Users = Object.entries(userDays).filter(([_, days]) => days.has(1)).length;
        const day2Users = Object.entries(userDays).filter(([_, days]) => days.has(1) && days.has(2)).length;
        const d1Retention = day1Users > 0 ? (day2Users / day1Users * 100).toFixed(2) : 0;

        // 3. Average Reflection Words
        const { data: reflections } = await supabaseAdmin
            .from('entries')
            .select('user_text')
            .neq('user_text', '')
            .not('user_text', 'is', null);

        const avgWords = reflections && reflections.length > 0
            ? Math.round(reflections.reduce((sum, r) => {
                const words = r.user_text.trim().split(/\s+/).length;
                return sum + words;
            }, 0) / reflections.length)
            : 0;

        // 4. Survey Submissions
        const { count: surveyCount } = await supabaseAdmin
            .from('survey_responses')
            .select('*', { count: 'exact', head: true });

        const surveyRate = completedUsers > 0 ? (surveyCount / completedUsers * 100).toFixed(2) : 0;

        // 5. Recent Survey Responses
        const { data: recentSurveys } = await supabaseAdmin
            .from('survey_responses')
            .select('access_code, definition, thought_change, would_miss, submitted_at')
            .order('submitted_at', { ascending: false })
            .limit(5);

        // 6. Drop-off by Day
        const dropOffData = [];
        for (let day = 1; day <= 14; day++) {
            const usersAtDay = Object.values(userDays).filter(days => days.has(day)).length;
            dropOffData.push({ day, users: usersAtDay });
        }

        res.json({
            overview: {
                totalUsers,
                completedUsers,
                completionRate: parseFloat(completionRate),
                d1Retention: parseFloat(d1Retention),
                avgReflectionWords: avgWords,
                surveySubmissions: surveyCount || 0,
                surveyRate: parseFloat(surveyRate)
            },
            dropOff: dropOffData,
            recentSurveys: recentSurveys || []
        });
    } catch (error) {
        console.error('Admin metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

app.listen(PORT, () => {
    console.log(`Mirifer Backend running on http://localhost:${PORT}`);
});

// Protected route: Generate 7-Day PDF report
app.get('/api/mirifer/report-7.pdf', requireUser, async (req, res) => {
    try {
        // Fetch entries for days 1-7
        const { data: entries, error: dbError } = await supabaseAdmin
            .from('entries')
            .select('day, title, question, user_text, ai_text, mode, created_at')
            .eq('trial_user_id', req.user.id)
            .lte('day', 7)
            .order('day', { ascending: true });

        if (dbError) {
            console.error('Report Error:', dbError);
            return res.status(500).json({ error: 'Failed to fetch entries' });
        }

        // Validation: Check for exactly 7 days (1-7)
        const days = entries.map(e => e.day).sort((a, b) => a - b);
        const expectedDays = Array.from({ length: 7 }, (_, i) => i + 1);
        const hasAllDays = days.length === 7 &&
            days.every((day, i) => day === expectedDays[i]);

        if (!hasAllDays) {
            return res.status(409).json({
                error: 'REPORT_INCOMPLETE',
                message: 'Report unavailable: complete Days 1-7 first.'
            });
        }

        // Check that all entries have complete data
        const hasCompleteData = entries.every(e =>
            e.user_text && e.user_text.trim().length > 0 &&
            e.ai_text && e.ai_text.trim().length > 0
        );

        if (!hasCompleteData) {
            return res.status(409).json({
                error: 'REPORT_INCOMPLETE',
                message: 'Report unavailable: your journey data is incomplete.'
            });
        }

        // Generate 7-day PDF
        const pdfDoc = generateMiriferReport(entries, { accessCode: req.user.access_code, reportType: '7-day' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=\"mirifer-7day-report.pdf\"');
        pdfDoc.pipe(res);

    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});


// Protected route: Generate 7-Day PDF report
app.get('/api/mirifer/report-7.pdf', requireUser, async (req, res) => {
    try {
        // Fetch entries for days 1-7
        const { data: entries, error: dbError } = await supabaseAdmin
            .from('entries')
            .select('day, title, question, user_text, ai_text, mode, created_at')
            .eq('trial_user_id', req.user.id)
            .lte('day', 7)
            .order('day', { ascending: true });

        if (dbError) {
            console.error('Report Error:', dbError);
            return res.status(500).json({ error: 'Failed to fetch entries' });
        }

        // Validation: Check for exactly 7 days (1-7)
        const days = entries.map(e => e.day).sort((a, b) => a - b);
        const expectedDays = Array.from({ length: 7 }, (_, i) => i + 1);
        const hasAllDays = days.length === 7 &&
            days.every((day, i) => day === expectedDays[i]);

        if (!hasAllDays) {
            return res.status(409).json({
                error: 'REPORT_INCOMPLETE',
                message: 'Report unavailable: complete Days 1-7 first.'
            });
        }

        // Check that all entries have complete data
        const hasCompleteData = entries.every(e =>
            e.user_text && e.user_text.trim().length > 0 &&
            e.ai_text && e.ai_text.trim().length > 0
        );

        if (!hasCompleteData) {
            return res.status(409).json({
                error: 'REPORT_INCOMPLETE',
                message: 'Report unavailable: your journey data is incomplete.'
            });
        }

        // Generate 7-day PDF
        const pdfDoc = generateMiriferReport(entries, { accessCode: req.user.access_code, reportType: '7-day' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="mirifer-7day-report.pdf"');
        pdfDoc.pipe(res);

    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});


// Test endpoint: Generate a simple test PDF
app.get('/api/test/pdf', requireUser, async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="test-report.pdf"');

        doc.pipe(res);

        doc.fontSize(25)
            .text('Your Report is Ready!', 100, 100);

        doc.fontSize(12)
            .text(`Generated at: ${new Date().toISOString()}`, 100, 150);

        doc.fontSize(10)
            .text(`User: ${req.user.access_code}`, 100, 180);

        doc.end();
    } catch (error) {
        console.error('Test PDF Error:', error);
        res.status(500).json({ error: 'Failed to generate test PDF' });
    }
});

