import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "./Header";
import { toast } from "react-toastify";
import { Form, Input, Button, Card, Typography, Select, Divider } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SignUpSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false); // false = Signup, true = Login
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const navigateByRole = async (uid) => {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    const data = snapshot.data();
    const userRole = data?.role || "teacher";

    if (userRole === "admin") {
      navigate("/admin");
    } else if (userRole === "student") {
      navigate("/student");
    } else {
      navigate("/dashboard");
    }
  };

  const createUserDocument = async (user, additionalData = {}) => {
    setLoading(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(
          userRef,
          {
            name: displayName || additionalData.name,
            email,
            photoURL: photoURL || "",
            createdAt,
            role: additionalData.role || "teacher",
            rollNo: additionalData.role === "student" ? additionalData.rollNo : "",
          },
          { merge: true }
        );
        toast.success("Account Created!");
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
      }
    }
    setLoading(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    const { name, email, password, confirmPassword, role, rollNo } = values;

    if (!flag) {
      // Sign Up Logic
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        setLoading(false);
        return;
      }
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await createUserDocument(user, { name, role, rollNo });
        toast.success("Successfully Signed Up!");
        await navigateByRole(user.uid);
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } else {
      // Sign In Logic
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        toast.success("Logged In Successfully!");
        await navigateByRole(user.uid);
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user);
      toast.success("User Authenticated Successfully!");
      await navigateByRole(user.uid);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', background: '#F3F4F6' }}>
        <Card
          hoverable
          style={{ width: '100%', maxWidth: '450px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              {flag ? 'Welcome Back!' : 'Create Account'}
            </Title>
            <Text type="secondary">
              {flag ? 'Enter your credentials to access your dashboard.' : 'Get started by creating your account.'}
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ role: 'teacher' }}
            size="large"
          >
            {!flag && (
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please enter your full name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email Address" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            {!flag && (
              <>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item name="role" label="I am a:">
                  <Select>
                    <Option value="teacher">Teacher</Option>
                    <Option value="student">Student</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('role') === 'student' ? (
                      <Form.Item
                        name="rollNo"
                        rules={[{ required: true, message: 'Please enter your Roll Number!' }]}
                      >
                        <Input placeholder="Roll Number (e.g. B001)" />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} style={{ fontWeight: 600 }}>
                {flag ? 'Log In' : 'Sign Up'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Or</Divider>

          <Button
            block
            icon={<GoogleOutlined />}
            onClick={signInWithGoogle}
            loading={loading}
            style={{ marginBottom: '16px' }}
          >
            Continue with Google
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text>
              {flag ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => {
                  setFlag(!flag);
                  form.resetFields();
                }}
                style={{ color: '#1890ff', cursor: 'pointer', fontWeight: 500 }}
              >
                {flag ? "Sign Up" : "Log In"}
              </span>
            </Text>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SignUpSignIn;
