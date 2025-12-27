// Simple admin authentication middleware
function requireAdmin(req, res, next) {
    const adminPassword = req.headers['x-admin-password'];

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

module.exports = { requireAdmin };
