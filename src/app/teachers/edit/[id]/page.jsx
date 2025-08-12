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
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const { Option } = Select;

export default function EditTeacherPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const onFinish = (values) => {
    console.log("Submitted Teacher:", values);
    message.success("Teacher added successfully!");
    form.resetFields();
    // Send data to backend here
  };

  return (
    <div className="">
      <div className="flex mb-4 items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/courses")}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
                Back
              </button>
              
            </div>

      <BreadCrumb title="Add Teacher" parent="Teachers" child="Edit" />

      <Card className="mt-5 !bg-transparent !border-0">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Full Name */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: "Please enter the teacher's full name" }]}
          >
            <Input placeholder="Enter full name" />
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
            <Input placeholder="Enter email address" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: "Please enter the phone number" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          {/* Subject */}
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter the subject taught" }]}
          >
            <Input placeholder="e.g., Mathematics, English" />
          </Form.Item>

          {/* Years of Experience */}
          <Form.Item
            label="Years of Experience"
            name="experience"
            rules={[
              { required: true, message: "Please enter years of experience" },
              { type: "number", min: 0, max: 50, message: "Must be between 0 and 50" },
            ]}
          >
            <InputNumber placeholder="Enter years of experience" style={{ width: "100%" }} min={0} max={50} />
          </Form.Item>

          {/* Employment Status */}
          <Form.Item
            label="Employment Status"
            name="status"
            rules={[{ required: true, message: "Please select employment status" }]}
          >
            <Select placeholder="Select status">
              <Option value="Full-Time">Full-Time</Option>
              <Option value="Part-Time">Part-Time</Option>
              <Option value="On Leave">On Leave</Option>
            </Select>
          </Form.Item>

          {/* Hire Date */}
          <Form.Item
            label="Hire Date"
            name="hireDate"
            rules={[{ required: true, message: "Please select hire date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit" className="!bg-[#02AAA0] hover:!bg-[#029a92]">
              Edit Teacher
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
