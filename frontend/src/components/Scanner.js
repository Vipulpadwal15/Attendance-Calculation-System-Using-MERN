import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Scanner.css';
import { Spin } from 'antd';

const QrScanner = () => {
    const { lectureId } = useParams();
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const scannerRef = useRef(null);
    const [processing, setProcessing] = useState(false);

    const onScanSuccess = useCallback(async (decodedText, decodedResult) => {
        if (processing) return;

        // Stop scanning temporarily
        if (scannerRef.current) {
            scannerRef.current.clear();
        }
        setProcessing(true);

        try {
            const response = await axios.post('http://localhost:5000/api/attendance/scan', {
                lectureId,
                qrData: decodedText
            });

            // Navigate to Result Screen on Success
            navigate('/scan-result', {
                state: {
                    status: 'success',
                    message: response.data.message,
                    student: response.data.attendance?.student,
                    lectureId
                }
            });

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Invalid Scan or Server Error';

            // Navigate to Result Screen on Error
            navigate('/scan-result', {
                state: {
                    status: 'error',
                    message: errorMsg,
                    lectureId
                }
            });
        }
    }, [lectureId, navigate, processing]);

    useEffect(() => {
        if (!lectureId) {
            navigate('/dashboard');
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );
        scannerRef.current = scanner;

        scanner.render(onScanSuccess, (error) => {
            // console.warn(error);
        });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [lectureId, navigate, onScanSuccess]);

    return (
        <div className="scanner-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <h2>Scan Student QR Code</h2>
            <div id="reader" style={{ width: '100%', maxWidth: '500px' }}></div>
            {processing && <Spin size="large" style={{ marginTop: '20px' }} />}
            <p style={{ marginTop: '20px', color: '#666' }}>Align QR code within the frame</p>
        </div>
    );
};

export default QrScanner;
