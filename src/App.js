import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ExerciseList from './ExerciseList';
import Exercise from './Exercise';

function App() {
  useEffect(() => {
    const htmlElement = document.querySelector('html');
    htmlElement.setAttribute('data-bs-theme', 'dark');
  }, []);


  return (
    <div className="App theme-dark">
      <HashRouter>
        <Routes>
          <Route path="/" element={
            <div className="App theme-dark">
              <ExerciseList />
            </div>} />
          <Route path="/exercise/:exerciseId" element={<Exercise />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
