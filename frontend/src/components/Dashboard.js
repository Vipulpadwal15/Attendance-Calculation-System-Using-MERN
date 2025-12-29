import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Spin, Empty } from "antd";
import { PlusOutlined, NumberOutlined, CheckCircleOutlined, CloseCircleOutlined, PieChartOutlined } from "@ant-design/icons";
import StatCard from "./Dashboard/StatCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLectures: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/attendance/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/lecture/setup')}
          style={{ borderRadius: '6px', height: '44px', fontWeight: 600 }}
        >
          Take Attendance
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Lectures"
              value={stats.totalLectures}
              icon={<NumberOutlined />}
              color="#3b82f6"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Attendance %"
              value={`${stats.attendancePercentage}%`}
              icon={<PieChartOutlined />}
              color="#8b5cf6"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Present"
              value={stats.presentCount}
              icon={<CheckCircleOutlined />}
              color="#10b981"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Absent"
              value={stats.absentCount}
              icon={<CloseCircleOutlined />}
              color="#ef4444"
            />
          </Col>
        </Row>
      )}

      {!loading && stats.totalLectures === 0 && (
        <div style={{ marginTop: '48px' }}>
          <Empty description="No lectures found. Start by taking attendance!" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
