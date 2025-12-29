import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Card } from 'antd';
import { ScanOutlined, DashboardOutlined } from '@ant-design/icons';

const ScanResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { status, message, student, lectureId } = location.state || {};

    // Redirect to dashboard if accessed directly without state
    if (!location.state) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page directly."
                extra={<Button type="primary" onClick={() => navigate('/dashboard')}>Back Home</Button>}
            />
        );
    }

    const isSuccess = status === 'success';

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <Card style={{ width: '100%', maxWidth: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <Result
                    status={isSuccess ? 'success' : 'error'}
                    title={isSuccess ? 'Attendance Marked!' : 'Scan Failed'}
                    subTitle={
                        <div>
                            <p style={{ fontSize: '16px', fontWeight: 500 }}>{message}</p>
                            {student && (
                                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginTop: '12px', textAlign: 'left' }}>
                                    <p style={{ margin: 0 }}><strong>Student:</strong> {student.name}</p>
                                    <p style={{ margin: 0 }}><strong>Roll No:</strong> {student.rollNo}</p>
                                </div>
                            )}
                        </div>
                    }
                    extra={[
                        <Button
                            type="primary"
                            key="scan"
                            size="large"
                            icon={<ScanOutlined />}
                            onClick={() => navigate(`/scanner/${lectureId}`)}
                            style={{ width: '100%', marginBottom: '12px', height: '48px' }}
                        >
                            Scan Next Student
                        </Button>,
                        <Button
                            key="dashboard"
                            size="large"
                            icon={<DashboardOutlined />}
                            onClick={() => navigate('/dashboard')}
                            style={{ width: '100%', height: '48px' }}
                        >
                            Back to Dashboard
                        </Button>,
                    ]}
                />
            </Card>
        </div>
    );
};

export default ScanResult;
