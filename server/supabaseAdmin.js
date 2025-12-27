const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
    });
} else {
    console.error('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Supabase features disabled.');
}

module.exports = { supabaseAdmin };
