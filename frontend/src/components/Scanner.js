import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import './Scanner.css';

const QrScanner = () => {
    const [user] = useAuthState(auth);
    const [scannerStarted, setScannerStarted] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLecture, setSelectedLecture] = useState('');
    const defaultDate = new Date().toISOString().slice(0, 16);
    const [lectureForm, setLectureForm] = useState({
        date: defaultDate,
        topic: '',
        lectureNumber: '',
    });
    const [creatingLecture, setCreatingLecture] = useState(false);
    const scannerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchSubjects = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/subjects', {
                    params: { teacherId: user.uid },
                });
                setSubjects(res.data);
            } catch (error) {
                console.error('Failed to fetch subjects', error);
                setMessage('Could not load subjects. Please try again.');
                setShowMessage(true);
            }
        };
        fetchSubjects();
    }, [user]);

    const fetchLectures = async (subjectId) => {
        if (!subjectId) {
            setLectures([]);
            setSelectedLecture('');
            return;
        }
        try {
            const res = await axios.get('http://localhost:5000/api/lectures', {
                params: { subjectId },
            });
            setLectures(res.data);
        } catch (error) {
            console.error('Failed to fetch lectures', error);
            setMessage('Unable to load lectures for this subject.');
            setShowMessage(true);
        }
    };

    useEffect(() => {
        fetchLectures(selectedSubject);
    }, [selectedSubject]);

    const handleCreateLecture = async (e) => {
        e.preventDefault();
        if (!selectedSubject) {
            setMessage('Please select a subject before creating a lecture.');
            setShowMessage(true);
            return;
        }
        setCreatingLecture(true);
        try {
            await axios.post('http://localhost:5000/api/lectures', {
                subjectId: selectedSubject,
                date: lectureForm.date
                    ? new Date(lectureForm.date).toISOString()
                    : new Date().toISOString(),
                topic: lectureForm.topic,
                lectureNumber: lectureForm.lectureNumber,
            });
            setLectureForm({ date: defaultDate, topic: '', lectureNumber: '' });
            fetchLectures(selectedSubject);
            setMessage('Lecture created.');
            setShowMessage(true);
        } catch (error) {
            console.error('Failed to create lecture', error);
            setMessage(error.response?.data?.message || 'Could not create lecture');
            setShowMessage(true);
        } finally {
            setCreatingLecture(false);
        }
    };

    const startScanner = useCallback(() => {
        if (!selectedLecture) {
            setMessage('Select a lecture before starting the scanner.');
            setShowMessage(true);
            return;
        }

        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner('reader', {
                qrbox: { width: 250, height: 250 },
                fps: 20,
            });
        }

        const success = async (result) => {
            if (!scanResult || scanResult !== result) {
                setScanResult(result);
                setMessage('');

                try {
                    const response = await axios.post('http://localhost:5000/api/attendance/scan', {
                        lectureId: selectedLecture,
                        qrData: result,
                    });

                    if (response.status === 201) {
                        setMessage('Attendance saved successfully.');
                    }
                } catch (error) {
                    if (error.response && error.response.status === 409) {
                        setMessage('Attendance already recorded for this lecture.');
                    } else if (error.response && error.response.data?.message) {
                        setMessage(error.response.data.message);
                    } else {
                        setMessage('Failed to save attendance.');
                    }
                }

                setShowMessage(true);
                setTimeout(() => setShowMessage(false), 3000);
            }
        };

        const error = (err) => {
            console.error('QR Code Scan Error: ', err);
        };

        scannerRef.current.render(success, error);
    }, [scanResult, selectedLecture]);

    useEffect(() => {
        if (scannerStarted) {
            startScanner();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, [scannerStarted, startScanner]);

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
            setScannerStarted(false);
        }
    };

    const handleStartClick = () => {
        if (!selectedLecture) {
            setMessage('Select a lecture before starting the scanner.');
            setShowMessage(true);
            return;
        }
        setScannerStarted(true);
    };

    return (
        <main className="scanner-container">
            <h2>Teacher Scanner</h2>
            <div className="setup-panel">
                <div className="input-wrapper">
                    <p>Select Subject</p>
                    <select
                        className="custom-input"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.name} ({subject.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-wrapper">
                    <p>Select Lecture</p>
                    <select
                        className="custom-input"
                        value={selectedLecture}
                        onChange={(e) => setSelectedLecture(e.target.value)}
                        disabled={!lectures.length}
                    >
                        <option value="">-- Choose Lecture --</option>
                        {lectures.map((lecture) => (
                            <option key={lecture._id} value={lecture._id}>
                                {lecture.topic || 'Lecture'} • {new Date(lecture.date).toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                <form className="lecture-form" onSubmit={handleCreateLecture}>
                    <p>Create Lecture</p>
                    <input
                        className="custom-input"
                        type="datetime-local"
                        value={lectureForm.date}
                        onChange={(e) => setLectureForm({ ...lectureForm, date: e.target.value })}
                    />
                    <input
                        className="custom-input"
                        placeholder="Topic / Agenda"
                        value={lectureForm.topic}
                        onChange={(e) => setLectureForm({ ...lectureForm, topic: e.target.value })}
                    />
                    <input
                        className="custom-input"
                        placeholder="Lecture No."
                        value={lectureForm.lectureNumber}
                        onChange={(e) => setLectureForm({ ...lectureForm, lectureNumber: e.target.value })}
                    />
                    <button className="btn btn-blue" type="submit" disabled={creatingLecture}>
                        {creatingLecture ? 'Creating...' : 'Create Lecture'}
                    </button>
                </form>
            </div>

            {!scannerStarted && (
                <button onClick={handleStartClick} className="scanner-btn" disabled={!selectedLecture}>
                    {selectedLecture ? 'Start Scanner' : 'Select lecture to start'}
                </button>
            )}
            {scannerStarted && <div id="reader" className="qr-reader"></div>}

            {showMessage && (
                <div className="success-container">
                    <h2 className="success-message">{message}</h2>
                </div>
            )}

            {scannerStarted && (
                <button onClick={stopScanner} className="scanner-btn stop-btn">
                    Stop Scanner
                </button>
            )}
            <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
                Go to Dashboard
            </button>
        </main>
    );
};

export default QrScanner;
