import React, { useCallback, useEffect, useState } from "react";
import { Card, Row } from "antd";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import axios from "axios";
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { unparse } from "papaparse";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLectures, setTotalLectures] = useState(0);
  const [present, setPresent] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const navigate = useNavigate();

  // Process chart data from attendance transactions
  const processChartData = () => {
    const balanceData = [];
    const spendingData = {};

    transactions.forEach((transaction) => {
      const monthYear = moment(transaction.date).format("MMM YYYY");
      const status = transaction.type;

      const existingEntry = balanceData.find(
        (data) => data.month === monthYear
      );
      if (existingEntry) {
        existingEntry.count += transaction.amount;
      } else {
        balanceData.push({ month: monthYear, count: transaction.amount });
      }

      spendingData[status] = (spendingData[status] || 0) + transaction.amount;
    });

    const spendingDataArray = Object.keys(spendingData).map((key) => ({
      category: key,
      value: spendingData[key],
    }));

    return { balanceData, spendingDataArray };
  };

  const { balanceData, spendingDataArray } = processChartData();

  const showExpenseModal = () => setIsExpenseModalVisible(true);
  const showIncomeModal = () => setIsIncomeModalVisible(true);
  const handleExpenseCancel = () => setIsExpenseModalVisible(false);
  const handleIncomeCancel = () => setIsIncomeModalVisible(false);

  const onFinish = (values, type) => {
    const newTransaction = {
      type,
      date: moment(values.date).format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    calculateSummary([...transactions, newTransaction]);
  };

  const calculateSummary = (items) => {
    const presentTotal = items.reduce((total, transaction) => {
      return transaction.type === "present" ? total + transaction.amount : total;
    }, 0);

    const leavesTotal = items.reduce((total, transaction) => {
      return transaction.type === "absent" ? total + transaction.amount : total;
    }, 0);

    setPresent(presentTotal);
    setLeaves(leavesTotal);
    setTotalLectures(presentTotal + leavesTotal);
  };

  // Recalculate summary whenever transactions change
  useEffect(() => {
    calculateSummary(transactions);
  }, [transactions]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/qrcodes");

      const transactionsArray = response.data.map((item) => {
        let parsed = null;
        try {
          parsed = JSON.parse(item.data);
        } catch (e) {
          // if QR content is not valid JSON, fall back to raw string
        }

        return {
          raw: item.data,
          name: parsed?.name || parsed?.studentName || item.data,
          rollNo: parsed?.rollNo || "",
          contact: parsed?.contact || "",
          type: "present",
          date: moment(item.createdAt).format("YYYY-MM-DD"),
          amount: 1,
          tag: "present",
        };
      });

      setTransactions(transactionsArray);
      calculateSummary(transactionsArray);
      toast.success("Attendance fetched!");
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchTransactions();
    }
  }, [user, navigate, fetchTransactions]);

  const resetDashboard = () => {
    setTransactions([]);
    setPresent(0);
    setLeaves(0);
    setTotalLectures(0);
  };

  const balanceConfig = {
    data: balanceData,
    xField: "month",
    yField: "count",
  };

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
  };

  const cardStyle = {
    boxShadow: "0px 0px 30px 8px rgba(227, 227, 227, 0.75)",
    margin: "2rem",
    borderRadius: "0.5rem",
    minWidth: "400px",
    flex: 1,
  };

  const attendanceRate =
    totalLectures > 0 ? Math.round((present / totalLectures) * 100) : 0;

  const exportToCsv = () => {
    const csv = unparse(transactions, {
      fields: ["name", "rollNo", "contact", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Attendance Overview</h1>
          <p className="dashboard-subtitle">
            Track your total lectures, presence and leaves at a glance.
          </p>
        </div>
        <div
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            background:
              attendanceRate >= 75 ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
            color: attendanceRate >= 75 ? "#15803d" : "#b91c1c",
            fontWeight: 600,
          }}
        >
          Attendance: {attendanceRate}%
        </div>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <Loader />
        ) : (
          <>
            <Cards
              totalLectures={totalLectures}
              present={present}
              leaves={leaves}
              showExpenseModal={showExpenseModal}
              showIncomeModal={showIncomeModal}
              cardStyle={cardStyle}
              reset={resetDashboard}
            />

            <AddExpenseModal
              isExpenseModalVisible={isExpenseModalVisible}
              handleExpenseCancel={handleExpenseCancel}
              onFinish={onFinish}
            />
            <AddIncomeModal
              isIncomeModalVisible={isIncomeModalVisible}
              handleIncomeCancel={handleIncomeCancel}
              onFinish={onFinish}
            />
            {transactions.length === 0 ? (
              <NoTransactions />
            ) : (
              <Row gutter={16}>
                <Card bordered={true} style={cardStyle}>
                  <h2>Attendance Trend</h2>
                  <Line {...balanceConfig} />
                </Card>
                <Card bordered={true} style={{ ...cardStyle, flex: 0.45 }}>
                  <h2>Present vs Absent</h2>
                  {spendingDataArray.length === 0 ? (
                    <p>No leaves recorded yet.</p>
                  ) : (
                    <Pie {...spendingConfig} />
                  )}
                </Card>
              </Row>
            )}
            <TransactionSearch
              transactions={transactions}
              exportToCsv={exportToCsv}
              fetchTransactions={fetchTransactions}
              addTransaction={() => {}}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
