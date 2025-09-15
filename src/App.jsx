import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaskListPage />} />
        <Route path="/task/:id" element={<TaskDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
