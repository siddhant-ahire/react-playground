import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlaygroundPage from './routes/PlaygroundPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/playground" element={<PlaygroundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
