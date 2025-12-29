import './ProgressHeatMap.css';

function ProgressHeatMap({ completedDays = [] }) {
    const totalDays = 14;
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    return (
        <div className="progress-heatmap">
            <h3 className="heatmap-title">Your Journey Progress</h3>
            <div className="heatmap-grid">
                {days.map(day => {
                    const isCompleted = completedDays.includes(day);
                    return (
                        <div
                            key={day}
                            className={`heatmap-square ${isCompleted ? 'completed' : 'incomplete'}`}
                            title={`Day ${day}${isCompleted ? ' - Complete' : ''}`}
                        >
                            <span className="day-number">{day}</span>
                        </div>
                    );
                })}
            </div>
            <p className="heatmap-summary">
                <strong>{completedDays.length}</strong> of {totalDays} days complete
            </p>
        </div>
    );
}

export default ProgressHeatMap;
