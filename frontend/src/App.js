import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import SignUpSignIn from "./components/SignUpSignIn";
import Dashboard from "./components/Dashboard";
import Scanner from "./components/Scanner";
import Loader from "./components/Loader";
import MainLayout from "./components/Layout/MainLayout";
import LectureSetup from "./components/Lecture/LectureSetup";
import ScanResult from "./components/ScanResult";

const App = () => {
  const [user, loading] = useAuthState(auth);
  // Role based logic kept for future extensibility, but currently focusing on Teacher flow as per requirements
  // If role is needed later, we can re-enable it. For now, we assume logged in user is a Teacher/Admin.

  if (loading) return <Loader />;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!user ? <SignUpSignIn /> : <Navigate to="/dashboard" />}
        />

        {/* Protected Routes wrapped in MainLayout */}
        <Route element={user ? <MainLayout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lecture/setup" element={<LectureSetup />} />
          <Route path="/scanner/:lectureId" element={<Scanner />} />
          <Route path="/scan-result" element={<ScanResult />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
