import { supabase } from '../../lib/supabase';
import './Journey.css';

const Journey = () => {
    const navigate = useNavigate();
    const [journeyState, setJourneyState] = useState({});

    useEffect(() => {
        const loadJourneyState = async () => {
            const { data, error } = await supabase
                .from('system_state')
                .select('value')
                .eq('key', 'mirifer_journey')
                .single();

            if (data && data.value) {
                setJourneyState(data.value);
                // Also update local for immediate speed on next load
                localStorage.setItem('mirifer_journey', JSON.stringify(data.value));
            } else {
                // Fallback to local
                const savedJourney = JSON.parse(localStorage.getItem('mirifer_journey') || '{}');
                setJourneyState(savedJourney);
            }
        };

        loadJourneyState();
    }, []);

    const getStatus = (dayId) => {
        return journeyState[dayId] || 'Not started';
    };

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(' ', '-');
    };

    return (
        <div className="journey-database">
            <h3 className="notion-block">Mirifer Journey</h3>
            <div className="database-table">
                <div className="table-header">
                    <div className="col-day">Day</div>
                    <div className="col-title">Title</div>
                    <div className="col-status">Status</div>
                </div>
                <div className="table-body">
                    {MIRIFER_DAYS.map((day) => (
                        <div
                            key={day.day}
                            className="table-row"
                            onClick={() => navigate(`/day/${day.day}`)}
                        >
                            <div className="col-day">{day.day}</div>
                            <div className="col-title">{day.title}</div>
                            <div className="col-status">
                                <span className={`status-pill ${getStatusClass(getStatus(day.day))}`}>
                                    {getStatus(day.day)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Journey;
