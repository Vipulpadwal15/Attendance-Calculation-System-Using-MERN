import React from "react";
import Header from "./Header";
import Dashboard from "./Dashboard";

// For now, reuse the main dashboard but conceptually this is the student view.
const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <h1 className="dashboard-title">My Attendance</h1>
        <p className="dashboard-subtitle">
          This view will focus on your own attendance across subjects.
        </p>
        <Dashboard />
      </div>
    </div>
  );
};

export default StudentDashboard;


