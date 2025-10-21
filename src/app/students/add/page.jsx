"use client";
import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  message,
} from "antd";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { timezoneOptions } from "../../../utils/timeZone";

const { Option } = Select;

export default function AddStudentPage() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // Format the date if it exists
    const formattedValues = {
      ...values,
      enrollmentDate: values.enrollmentDate
        ? values.enrollmentDate.format("YYYY-MM-DD")
        : null,
    };

    console.log("Submitted Student:", formattedValues);
    message.success("Student added successfully!");
    form.resetFields();
    // You can send this data to your backend via fetch or axios
  };

  return (
    <div className="">
      <BreadCrumb title="Add Student" parent="Students" child="Add" />

      <Card className="!mt-5 !bg-transparent !border-0">
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
            rules={[
              { required: true, message: "Please enter the student name" },
            ]}
          >
            <Input placeholder="Enter student full name" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter the email address" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter student email" />
          </Form.Item>

          {/* Country */}
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Please enter the country" }]}
          >
            <Input placeholder="Enter country" />
          </Form.Item>

          {/* Timezone */}
          <Form.Item
            label="Timezone"
            name="timezone"
            rules={[{ required: true, message: "Please select the timezone" }]}
          >
            <Select
              placeholder="Select timezone"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {timezoneOptions.map((timezone) => (
                <Option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter the password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please enter the phone number" },
            ]}
          >
            <Input placeholder="Enter student phone number" />
          </Form.Item>

          {/* Group */}
          <Form.Item
            label="Group"
            name="group"
            // rules={[{ required: true, message: "Please enter the group" }]}
          >
            <Select placeholder="Select group">
              <Select.Option value="A">A</Select.Option>
              <Select.Option value="B">B</Select.Option>
              <Select.Option value="C">C</Select.Option>
            </Select>
          </Form.Item>

          {/* Level */}
          <Form.Item
            label="Level"
            name="level"
            // rules={[{ required: true, message: "Please enter Level" }]}
          >
            <Select placeholder="Select level">
              <Select.Option value="beginner">Beginner</Select.Option>
              <Select.Option value="intermediate">Intermediate</Select.Option>
              <Select.Option value="hard">Hard</Select.Option>
            </Select>
          </Form.Item>

          {/* Status */}
          <Form.Item
            label="Status"
            name="status"
            rules={[
              { required: true, message: "Please select student status" },
            ]}
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
            rules={[
              { required: true, message: "Please select enrollment date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="text-right">
            <Button
              type="primary"
              htmlType="submit"
              className="!bg-[#02AAA0] hover:!bg-[#029a92]"
            >
              Add Student
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
