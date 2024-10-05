import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import './Scanner.css'; // Import the CSS file for custom styling

const QrScanner = () => {
    const [scannerStarted, setScannerStarted] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState(''); // To display different messages
    const scannerRef = useRef(null); // Reference to keep track of the scanner instance
    const navigate = useNavigate();

    const startScanner = () => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 20,
            });
        }

        const success = async (result) => {
            console.log('Scanned QR Code:', result); // Add logging to see the scanned data

            // Avoid reprocessing the same QR code scan
            if (!scanResult || scanResult !== result) {
                setScanResult(result);
                setMessage(''); // Clear previous message

                try {
                    // Send POST request to save the scanned QR code data
                    const response = await axios.post('http://localhost:5000/api/qrcodes', { data: result }); // Change here

                    // If saving is successful
                    if (response.status === 200) { // Adjusted to 200 for a successful save
                        console.log('Response from backend:', response.data.message); // Log for successful response
                        setMessage('Success! Attendance saved.');
                    }
                } catch (error) {
                    // Check if it's a conflict error (409)
                    if (error.response && error.response.status === 400) { // Adjusted to 400 to match your server code
                        console.log('Response from backend:', error.response.data.message); // Log error message
                        setMessage('Attendance already saved!');
                    } else {
                        console.error('Error saving QR code data', error);
                    }
                }

                // Automatically hide the message after 3 seconds
                setShowMessage(true);
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000);
            }
        };

        const error = (err) => {
            console.error("QR Code Scan Error: ", err);
        };

        // Start scanning
        scannerRef.current.render(success, error);
    };

    useEffect(() => {
        if (scannerStarted) {
            startScanner(); // Start scanner when scannerStarted is true
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear(); // Clear scanner if component unmounts
            }
        };
    }, [scannerStarted]);

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear(); // Stop the scanner manually
            scannerRef.current = null; // Reset scanner reference
            setScannerStarted(false); // Stop the scanner
        }
    };

    return (
        <main className="scanner-container">
            {!scannerStarted && (
                <button
                    onClick={() => setScannerStarted(true)}
                    className="scanner-btn"
                >
                    Request Camera Permissions
                </button>
            )}
            {scannerStarted && <div id="reader" className="qr-reader"></div>}

            <div id="result" className="result-display"></div>

            {showMessage && (
                <div className="success-container">
                    <h2 className="success-message">{message}</h2>
                </div>
            )}

            <button onClick={stopScanner} className="scanner-btn stop-btn">
                Stop Scanner
            </button>
            <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
                Go to Dashboard
            </button>
        </main>
    );
};

export default QrScanner;
