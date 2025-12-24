import { supabase } from '../../lib/supabase';
import './PatternOverview.css';

const PatternOverview = () => {
    const [totalPatterns, setTotalPatterns] = useState({});
    const [reflections, setReflections] = useState([]);
    const [manualState, setManualState] = useState({
        tensions: '',
        drains: '',
        energizes: ''
    });

    useEffect(() => {
        const loadSupabaseData = async () => {
            // Load all reflections to aggregate patterns
            const { data: reflectionsData } = await supabase
                .from('reflections')
                .select('day, content');

            const patternsCount = {};
            const texts = [];

            if (reflectionsData) {
                reflectionsData.forEach(item => {
                    const dayData = item.content || {};
                    if (dayData.patterns) {
                        dayData.patterns.forEach(p => {
                            patternsCount[p] = (patternsCount[p] || 0) + 1;
                        });
                    }
                    if (dayData.reflection) {
                        texts.push({ day: item.day, text: dayData.reflection });
                    }
                });
            }

            setTotalPatterns(patternsCount);
            setReflections(texts);

            // Load manual synthesis from system_state
            const { data: stateData } = await supabase
                .from('system_state')
                .select('key, value')
                .in('key', ['mirifer_tensions', 'mirifer_drains', 'mirifer_energizes']);

            if (stateData) {
                const newState = { ...manualState };
                stateData.forEach(item => {
                    const field = item.key.replace('mirifer_', '');
                    newState[field] = item.value || '';
                });
                setManualState(newState);
            }
        };

        loadSupabaseData();
    }, []);

    const handleManualChange = async (key, value) => {
        setManualState(prev => ({ ...prev, [key]: value }));
        localStorage.setItem(`mirifer_${key}`, value);
        await supabase
            .from('system_state')
            .upsert({
                key: `mirifer_${key}`,
                value: value
            });
    };

    return (
        <div className="container pattern-overview">
            <nav className="breadcrumb">
                <Link to="/">Mirifer</Link> / Pattern Overview
            </nav>

            <header className="notion-block">
                <h1>Patterns You’ve Noticed</h1>
                <p className="instruction">This page makes the system feel intelligent and reinforces your synthesis.</p>
            </header>

            <section className="patterns-summary notion-block">
                <h2>Emotional Themes</h2>
                {Object.keys(totalPatterns).length > 0 ? (
                    <div className="pattern-tags">
                        {Object.entries(totalPatterns).map(([pattern, count]) => (
                            <div key={pattern} className="pattern-tag">
                                <span className="tag-name">{pattern}</span>
                                <span className="tag-count">{count}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="secondary-text">No patterns noticed yet. Continue your daily reflections.</p>
                )}
            </section>

            <section className="repeating-tensions notion-block">
                <h2>Repeating Tensions</h2>
                <div className="tensions-content">
                    <p className="instruction"><em>"Things that kept appearing..."</em></p>
                    <textarea
                        className="manual-synthesis"
                        placeholder="Write your observations about repeating themes here..."
                        value={manualState.tensions}
                        onChange={(e) => handleManualChange('tensions', e.target.value)}
                    />
                </div>
            </section>

            <section className="drains-energizes notion-block">
                <h2>What Drains vs Energizes</h2>
                <div className="comparison-grid">
                    <div className="comparison-col">
                        <h3>Drains</h3>
                        <textarea
                            className="comparison-input"
                            placeholder="e.g., Overthinking..."
                            value={manualState.drains}
                            onChange={(e) => handleManualChange('drains', e.target.value)}
                        />
                    </div>
                    <div className="comparison-col">
                        <h3>Energizes</h3>
                        <textarea
                            className="comparison-input"
                            placeholder="e.g., Taking action..."
                            value={manualState.energizes}
                            onChange={(e) => handleManualChange('energizes', e.target.value)}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PatternOverview;
