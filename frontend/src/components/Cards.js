import React from "react";
import { Card, Row } from "antd";

function Cards({
  totalLectures,
  present,
  leaves,
  showExpenseModal,
  showIncomeModal,
  cardStyle,
  reset,
}) {
  return (
    <Row
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "space-between",
      }}
    >
      <Card bordered={true} style={cardStyle}>
        <h2>Total Lectures</h2>
        <p>{totalLectures}</p>
        <div className="btn btn-blue" style={{ margin: 0 }} onClick={reset}>
          Reset
        </div>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Attended</h2>
        <p>{present}</p>
        <div
          className="btn btn-blue"
          style={{ margin: 0 }}
          onClick={showIncomeModal}
        >
          Add Attendance
        </div>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Leaves</h2>
        <p>{leaves}</p>
        <div className="btn btn-blue" onClick={showExpenseModal}>
          Mark leaves
        </div>
      </Card>
    </Row>
  );
}

export default Cards;
