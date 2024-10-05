import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import './Scanner.css'; // Import the CSS file for custom styling

const QrScanner = () => {
    const [scannerStarted, setScannerStarted] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let scanner;

        const startScanner = () => {
            scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 20,
            });

            const success = async (result) => {
                setScanResult(result);
                document.getElementById('result').innerHTML = `
                    <h2 class="success-message">Success!</h2>
                    <p>Attendance Saved!</p>
                `;

                try {
                    await axios.post('http://localhost:5000/api/qrcodes', { data: result });
                } catch (error) {
                    console.error('Error saving QR code data', error);
                }

                scanner.clear();
                setScannerStarted(false);
            };

            const error = (err) => {
                console.error("QR Code Scan Error: ", err);
            };

            scanner.render(success, error);
        };

        if (scannerStarted) {
            startScanner();
        }

        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [scannerStarted]);

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
            {scanResult && (
                <>
                    <p className="scan-success-text">Scan successful! Attendance saved!</p>
                    <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
                        Go to Dashboard
                    </button>
                </>
            )}
        </main>
    );
};

export default QrScanner;
