import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Input, Button, Card, Typography, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

const { Title, Text } = Typography;
const { Option } = Select;

const LectureSetup = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [user] = useAuthState(auth);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error(error);
            message.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                subjectId: values.subjectId,
                date: values.date.toISOString(),
                topic: values.topic,
                lectureNumber: values.lectureNumber,
                email: user?.email // Pass Teacher Email
            };

            const response = await axios.post('http://localhost:5000/api/lectures', payload);
            message.success('Lecture created!');
            // Navigate to isolated scanner with lecture ID
            navigate(`/scanner/${response.data._id}`);
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to create lecture');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 0' }}>
            <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={3}>Start New Lecture</Title>
                    <Text type="secondary">Select subject and details to begin taking attendance</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ date: moment() }}
                >
                    <Form.Item
                        name="subjectId"
                        label="Subject"
                        rules={[{ required: true, message: 'Please select a subject' }]}
                    >
                        <Select
                            placeholder="Select Subject"
                            loading={loading}
                            size="large"
                        >
                            {subjects.map(sub => (
                                <Option key={sub._id} value={sub._id}>
                                    {sub.name} ({sub.code})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Date & Time"
                        rules={[{ required: true, message: 'Please select date' }]}
                    >
                        <DatePicker showTime size="large" style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="topic"
                        label="Topic / Agenda"
                    >
                        <Input placeholder="e.g. Introduction to React" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="lectureNumber"
                        label="Lecture Number (Optional)"
                    >
                        <Input type="number" placeholder="e.g. 5" size="large" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '24px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={submitting}
                            icon={<ArrowRightOutlined />}
                            style={{ height: '48px', fontWeight: 600 }}
                        >
                            Start Attendance
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LectureSetup;
