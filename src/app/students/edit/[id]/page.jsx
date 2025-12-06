"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  message,
  Spin,
} from "antd";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { timezoneOptions } from "../../../../utils/timeZone";

const { Option } = Select;

// Timezone options data (same as in AddStudentPage)

export default function EditStudentPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id;

  // Mock student data (in real app, fetch from API)
  const mockStudents = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      country: "United States",
      timezone: "America/New_York",
      password: "encrypted_password_1",
      phone: "+1 234 567 8901",
      group: "A",
      level: "intermediate",
      status: "Active",
      enrollmentDate: "2023-09-15",
    },
    {
      id: 2,
      name: "Ahmed Al-Mansouri",
      email: "ahmed.mansouri@email.com",
      country: "UAE",
      timezone: "Asia/Dubai",
      password: "encrypted_password_2",
      phone: "+971 50 123 4567",
      group: "B",
      level: "hard",
      status: "Active",
      enrollmentDate: "2023-09-12",
    },
  ];

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In real app: const response = await fetch(`/api/students/${studentId}`);
        // const studentData = await response.json();

        // Mock data retrieval
        const studentData = mockStudents.find(
          (s) => s.id === parseInt(studentId)
        );

        if (studentData) {
          form.setFieldsValue({
            ...studentData,
            enrollmentDate: dayjs(studentData.enrollmentDate),
          });
        } else {
          message.error("Student not found");
          router.push("/students");
        }
      } catch (error) {
        console.error("Error loading student:", error);
        message.error("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadStudentData();
    }
  }, [studentId, form, router]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Format the data
      const formattedValues = {
        ...values,
        enrollmentDate: values.enrollmentDate
          ? values.enrollmentDate.format("YYYY-MM-DD")
          : null,
      };

      console.log("Updated Student Data:", formattedValues);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real app:
      // const response = await fetch(`/api/students/${studentId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formattedValues)
      // });

      message.success("Student updated successfully!");
      router.push("/students");
    } catch (error) {
      console.error("Error updating student:", error);
      message.error("Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="">
      <BreadCrumb title="Edit Student" parent="Students" child="Edit" />

      <Card className="mt-5 !bg-transparent !border-0">
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
              loading={submitting}
              className="!bg-[#02AAA0] hover:!bg-[#029a92]"
            >
              {submitting ? "Updating..." : "Update Student"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
