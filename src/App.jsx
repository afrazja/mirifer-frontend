import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import DayPage from './pages/DayPage/DayPage';
import PatternOverview from './pages/PatternOverview/PatternOverview';
import FinalDirection from './pages/FinalDirection/FinalDirection';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/day/:id" element={<DayPage />} />
          <Route path="/patterns" element={<PatternOverview />} />
          <Route path="/direction" element={<FinalDirection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
