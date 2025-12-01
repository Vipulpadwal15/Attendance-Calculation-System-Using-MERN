import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import SignUpSignIn from "./components/SignUpSignIn";
import Dashboard from "./components/Dashboard";
import Scanner from "./components/Scanner";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import Loader from "./components/Loader";

const App = () => {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }
      setRoleLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        setRole(data?.role || "teacher");
      } catch (error) {
        setRole("teacher");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const getRolePath = (currentRole) => {
    if (currentRole === "admin") return "/admin";
    if (currentRole === "student") return "/student";
    return "/dashboard";
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/" />;
    if (roleLoading) return <Loader />;
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to={getRolePath(role)} />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              roleLoading ? (
                <Loader />
              ) : (
                <Navigate to={getRolePath(role)} />
              )
            ) : (
              <SignUpSignIn />
            )
          }
        />

        {/* Teacher views */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Scanner />
            </ProtectedRoute>
          }
        />

        {/* Admin view */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student view */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
