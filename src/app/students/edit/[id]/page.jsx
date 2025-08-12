"use client";
import React from "react";
import { Card, Form, Input, Button, DatePicker, Select, InputNumber, message } from "antd";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";

const { Option } = Select;

export default function EditStudentPage() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Submitted Student:", values);
    message.success("Student added successfully!");
    form.resetFields();
    // You can send this data to your backend via fetch or axios
  };

  return (
    <div className="">
      <BreadCrumb title="Edit Student" parent="Students" child="Edit" />

      <Card  className="mt-5 !bg-transparent !border-0">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Name */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: "Please enter the student name" }]}
          >
            <Input placeholder="Enter student full name" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter the email address" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input placeholder="Enter student email" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: "Please enter the phone number" }]}
          >
            <Input placeholder="Enter student phone number" />
          </Form.Item>

          {/* Class */}
          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Please enter the class" }]}
          >
            <Input placeholder="e.g., Grade 10A" />
          </Form.Item>

          {/* GPA */}
          <Form.Item
            label="GPA"
            name="gpa"
            rules={[
              { required: true, message: "Please enter GPA" },
              { type: "number", min: 0, max: 4, message: "GPA must be between 0.0 and 4.0" }
            ]}
          >
            <InputNumber placeholder="Enter GPA" style={{ width: "100%" }} step={0.1} min={0} max={4} />
          </Form.Item>

          {/* Status */}
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select student status" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {/* Enrollment Date */}
          <Form.Item
            label="Enrollment Date"
            name="enrollmentDate"
            rules={[{ required: true, message: "Please select enrollment date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit" className="!bg-[#02AAA0] hover:!bg-[#029a92]">
              Edit Student
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
