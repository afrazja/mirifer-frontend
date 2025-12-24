import { supabase } from '../../lib/supabase';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleReset = async () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete all your progress and reflections for all 14 days. This cannot be undone.")) {
            // Clear local
            localStorage.clear();

            // Clear cloud
            const { error: error1 } = await supabase.from('reflections').delete().neq('day', 0);
            const { error: error2 } = await supabase.from('system_state').delete().neq('key', '');

            if (error1 || error2) {
                alert("Reset failed on some cloud records. Please check your Supabase console.");
            }

            window.location.reload();
        }
    };

    return (
        <div className="container home-page">
            <header className="home-header notion-block">
                <img src="/logo.png" alt="Mirifer Logo" className="site-logo" />
                <h1>Mirifer — Uncertainty Reduction System</h1>
            </header>

            <section className="orientation notion-block">
                <Callout icon="🧭">
                    <strong>Mirifer helps you reduce uncertainty — not solve your life.</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                        <li>Each day takes 10–15 minutes.</li>
                        <li>There is nothing to optimize.</li>
                        <li>When today’s step is done, you stop.</li>
                    </ul>
                </Callout>
            </section>

            <section className="how-it-works notion-block">
                <Toggle title="How Mirifer Works">
                    <div className="explanation-content">
                        <ul>
                            <li>One question per day</li>
                            <li>One reflection with the Mirifer prompt</li>
                            <li>Optional pattern check</li>
                            <li>No advice, no fixing</li>
                            <li>Clear end each day</li>
                        </ul>
                        <p><em>Completion matters more than intensity.</em></p>
                    </div>
                </Toggle>
            </section>

            <Journey />

            <Divider />

            <section className="extra-links notion-block" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <NotionButton
                    type="secondary"
                    onClick={() => navigate('/patterns')}
                >
                    Pattern Overview
                </NotionButton>
                <NotionButton
                    type="secondary"
                    onClick={() => navigate('/direction')}
                >
                    Your Direction
                </NotionButton>
                <NotionButton
                    type="secondary"
                    onClick={handleReset}
                    style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                >
                    Reset System
                </NotionButton>
            </section>
        </div>
    );
};

export default Home;
