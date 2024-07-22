import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import GptApp from './GptApp';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/gpt-app" element={localStorage.getItem('authenticated') ? <GptApp /> : <Navigate to="/login" />} />



      </Routes>
    </Router>
  );
};

export default App;
