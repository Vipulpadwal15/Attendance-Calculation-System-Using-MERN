import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentForm, setStudentForm] = useState({
    name: "",
    rollNo: "",
    contact: "",
    email: "",
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    teacherId: "",
  });

  const loadStudents = async () => {
    const res = await axios.get("http://localhost:5000/api/students");
    setStudents(res.data);
  };

  const loadSubjects = async () => {
    const res = await axios.get("http://localhost:5000/api/subjects");
    setSubjects(res.data);
  };

  useEffect(() => {
    loadStudents();
    loadSubjects();
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/students", studentForm);
    setStudentForm({ name: "", rollNo: "", contact: "", email: "" });
    loadStudents();
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/subjects", subjectForm);
    setSubjectForm({ name: "", code: "", teacherId: "" });
    loadSubjects();
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Admin Panel</h1>
        <p className="dashboard-subtitle">
          Manage students and subjects for the attendance system.
        </p>

        <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
          <div style={{ flex: 1 }} className="my-table">
            <h2>Students</h2>
            <form onSubmit={handleStudentSubmit} style={{ marginBottom: "1rem" }}>
              <input
                className="custom-input"
                placeholder="Name"
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, name: e.target.value })
                }
              />
              <input
                className="custom-input"
                placeholder="Roll No"
                value={studentForm.rollNo}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, rollNo: e.target.value })
                }
              />
              <input
                className="custom-input"
                placeholder="Contact"
                value={studentForm.contact}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, contact: e.target.value })
                }
              />
              <input
                className="custom-input"
                placeholder="Email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
              />
              <button type="submit" className="btn btn-blue">
                Add Student
              </button>
            </form>
            <ul>
              {students.map((s) => (
                <li key={s._id}>
                  {s.name} ({s.rollNo}) - {s.email || "no email"}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: 1 }} className="my-table">
            <h2>Subjects</h2>
            <form onSubmit={handleSubjectSubmit} style={{ marginBottom: "1rem" }}>
              <input
                className="custom-input"
                placeholder="Name"
                value={subjectForm.name}
                onChange={(e) =>
                  setSubjectForm({ ...subjectForm, name: e.target.value })
                }
              />
              <input
                className="custom-input"
                placeholder="Code"
                value={subjectForm.code}
                onChange={(e) =>
                  setSubjectForm({ ...subjectForm, code: e.target.value })
                }
              />
              <input
                className="custom-input"
                placeholder="Teacher ID (Firebase UID)"
                value={subjectForm.teacherId}
                onChange={(e) =>
                  setSubjectForm({ ...subjectForm, teacherId: e.target.value })
                }
              />
              <button type="submit" className="btn btn-blue">
                Add Subject
              </button>
            </form>
            <ul>
              {subjects.map((s) => (
                <li key={s._id}>
                  {s.name} ({s.code})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


