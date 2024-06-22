import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ExerciseList from './ExerciseList';
import Exercise from './Exercise';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ExerciseList />} />
        <Route path="/exercise/:exerciseId" element={<Exercise/>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
