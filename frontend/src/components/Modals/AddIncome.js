import React from "react";
import { Button, Modal, Form, Input, DatePicker, Select } from "antd";

function AddIncomeModal({
  isIncomeModalVisible,
  handleIncomeCancel,
  onFinish,
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      style={{ fontWeight: 600 }}
      title="Add Attendance"
      open={isIncomeModalVisible}
      onCancel={handleIncomeCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values, "present");
          form.resetFields();
        }}
      >
        <Form.Item
          style={{ fontWeight: 600 }}
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the name of the Student!",
            },
          ]}
        >
          <Input type="text" className="custom-input" />
        </Form.Item>
        <Form.Item
          style={{ fontWeight: 600 }}
          label="Attended Lectures"
          name="amount"
          rules={[{ required: true, message: "Please input the lectures!" }]}
        >
          <Input type="number" className="custom-input" />
        </Form.Item>
        <Form.Item
          style={{ fontWeight: 600 }}
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select the date!" }]}
        >
          <DatePicker format="YYYY-MM-DD" className="custom-input" />
        </Form.Item>
        <Form.Item
          style={{ fontWeight: 600 }}
          label="Tag"
          name="tag"
          rules={[{ required: true, message: "Please select a tag!" }]}
        >
          <Select className="select-input-2">
            <Select.Option value="present">Present</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button className="btn btn-blue" type="primary" htmlType="submit">
            Save Attendance
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddIncomeModal;
