const { supabaseAdmin } = require('./supabaseAdmin');

/**
 * Code-based authentication middleware for trial users.
 * Expects X-Access-Code header with the user's access code.
 */
async function requireUser(req, res, next) {
    try {
        const accessCode = req.headers['x-access-code'];

        if (!accessCode) {
            return res.status(401).json({ error: 'Missing access code' });
        }

        // Validate access code against trial_users table
        const { data: user, error } = await supabaseAdmin
            .from('trial_users')
            .select('id, access_code, display_name, is_active')
            .eq('access_code', accessCode)
            .eq('is_active', true)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid access code' });
        }

        // Update last login time
        await supabaseAdmin
            .from('trial_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        // Attach user info to request
        req.user = {
            id: user.id,
            accessCode: user.access_code,
            displayName: user.display_name
        };

        next();
    } catch (e) {
        console.error('Auth Middleware Error:', e);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = { requireUser };
