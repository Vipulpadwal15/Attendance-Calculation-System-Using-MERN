import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase"; // Correct the path based on your structure


import SignUpSignIn from "./components/SignUpSignIn"; // Correct path to SignUpSignIn component
import Dashboard from "./components/Dashboard"; // Correct path to Dashboard component
import Scanner from "./components/Scanner"; // Correct path to Scanner component

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <Routes>
        {/* Redirect to dashboard if user is logged in */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <SignUpSignIn />} />
        
        {/* Protect Dashboard and Scanner routes */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/scanner" element={user ? <Scanner /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
