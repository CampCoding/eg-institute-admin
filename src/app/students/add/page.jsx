// "use client";
// import React from "react";
// import {
//   Card,
//   Form,
//   Input,
//   Button,
//   DatePicker,
//   Select,
//   InputNumber,
//   message,
// } from "antd";
// import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
// import { timezoneOptions } from "../../../utils/timeZone";

// const { Option } = Select;

// export default function AddStudentPage() {
//   const [form] = Form.useForm();

//   const onFinish = (values) => {
//     // Format the date if it exists
//     const formattedValues = {
//       ...values,
//       enrollmentDate: values.enrollmentDate
//         ? values.enrollmentDate.format("YYYY-MM-DD")
//         : null,
//     };

//     console.log("Submitted Student:", formattedValues);
//     message.success("Student added successfully!");
//     form.resetFields();
//     // You can send this data to your backend via fetch or axios
//   };

//   return (
//     <div className="">
//       <BreadCrumb title="Add Student" parent="Students" child="Add" />

//       <Card className="!mt-5 !bg-transparent !border-0">
//         <Form
//           layout="vertical"
//           form={form}
//           onFinish={onFinish}
//           autoComplete="off"
//         >
//           {/* Name */}
//           <Form.Item
//             label="Full Name"
//             name="name"
//             rules={[
//               { required: true, message: "Please enter the student name" },
//             ]}
//           >
//             <Input placeholder="Enter student full name" />
//           </Form.Item>

//           {/* Email */}
//           <Form.Item
//             label="Email Address"
//             name="email"
//             rules={[
//               { required: true, message: "Please enter the email address" },
//               { type: "email", message: "Please enter a valid email" },
//             ]}
//           >
//             <Input placeholder="Enter student email" />
//           </Form.Item>

//           {/* Country */}
//           <Form.Item
//             label="Country"
//             name="country"
//             rules={[{ required: true, message: "Please enter the country" }]}
//           >
//             <Input placeholder="Enter country" />
//           </Form.Item>

//           {/* Timezone */}
//           <Form.Item
//             label="Timezone"
//             name="timezone"
//             rules={[{ required: true, message: "Please select the timezone" }]}
//           >
//             <Select
//               placeholder="Select timezone"
//               showSearch
//               filterOption={(input, option) =>
//                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//               }
//             >
//               {timezoneOptions.map((timezone) => (
//                 <Option key={timezone.value} value={timezone.value}>
//                   {timezone.label}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           {/* Password */}
//           <Form.Item
//             label="Password"
//             name="password"
//             rules={[{ required: true, message: "Please enter the password" }]}
//           >
//             <Input.Password placeholder="Enter password" />
//           </Form.Item>

//           {/* Phone */}
//           <Form.Item
//             label="Phone Number"
//             name="phone"
//             rules={[
//               { required: true, message: "Please enter the phone number" },
//             ]}
//           >
//             <Input placeholder="Enter student phone number" />
//           </Form.Item>

//           {/* Group */}
//           <Form.Item
//             label="Group"
//             name="group"
//             // rules={[{ required: true, message: "Please enter the group" }]}
//           >
//             <Select placeholder="Select group">
//               <Select.Option value="A">A</Select.Option>
//               <Select.Option value="B">B</Select.Option>
//               <Select.Option value="C">C</Select.Option>
//             </Select>
//           </Form.Item>

//           {/* Level */}
//           <Form.Item
//             label="Level"
//             name="level"
//             // rules={[{ required: true, message: "Please enter Level" }]}
//           >
//             <Select placeholder="Select level">
//               <Select.Option value="beginner">Beginner</Select.Option>
//               <Select.Option value="intermediate">Intermediate</Select.Option>
//               <Select.Option value="hard">Hard</Select.Option>
//             </Select>
//           </Form.Item>

//           {/* Status */}
//           <Form.Item
//             label="Status"
//             name="status"
//             rules={[
//               { required: true, message: "Please select student status" },
//             ]}
//           >
//             <Select placeholder="Select status">
//               <Option value="Active">Active</Option>
//               <Option value="Inactive">Inactive</Option>
//             </Select>
//           </Form.Item>

//           {/* Enrollment Date */}
//           <Form.Item
//             label="Enrollment Date"
//             name="enrollmentDate"
//             rules={[
//               { required: true, message: "Please select enrollment date" },
//             ]}
//           >
//             <DatePicker style={{ width: "100%" }} />
//           </Form.Item>

//           {/* Submit Button */}
//           <Form.Item className="text-right">
//             <Button
//               type="primary"
//               htmlType="submit"
//               className="!bg-[#02AAA0] hover:!bg-[#029a92]"
//             >
//               Add Student
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// }

"use client";
import React, { useState } from "react";
import { Card, Form, Input, Button, DatePicker, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";

import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { timezoneOptions } from "../../../utils/timeZone";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import toast from "react-hot-toast";

const { Option } = Select;

// ✅ Yup schema
const schema = yup.object({
  name: yup.string().trim().required("Please enter the student name"),
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Please enter the email address"),
  // country: yup.string().trim().required("Please enter the country"),
  // timezone: yup.string().required("Please select the timezone"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Please enter the password"),
  phone: yup
    .string()
    .trim()
    .required("Please enter the phone number")
    .matches(/^[0-9+\-\s()]{7,}$/, "Please enter a valid phone number"),
  // group: yup.string().nullable().optional(),
  // level: yup.string().nullable().optional(),
  // status: yup
  //   .string()
  //   .oneOf(["Active", "Inactive"])
  //   .required("Please select student status"),
  // enrollmentDate: yup
  //   .mixed()
  //   .required("Please select enrollment date")
  //   .test("is-dayjs", "Invalid date", (v) => dayjs.isDayjs(v) && v.isValid()),
});

export default function AddStudentPage() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      timezone: undefined,
      password: "",
      phone: "",
      group: undefined,
      level: undefined,
      status: undefined,
      enrollmentDate: null,
    },
    mode: "onTouched",
  });

  const [addLoading, setAddLoading] = useState(false);

  const onSubmit = async (values) => {
    const token = localStorage.getItem("AccessToken");
    setAddLoading(true);
    const payload = {
      ...values,
      student_name: values?.name,
      student_email: values?.email,
      phone: values?.phone,
      password: values?.password,
      created_at: Date.now(),
      // enrollmentDate: values.enrollmentDate
      //   ? values.enrollmentDate.format("YYYY-MM-DD")
      //   : null,
    };

    console.log("Submitted Student:", payload);
    axios
      .post(BASE_URL + "/students/add_students.php", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res);
        if (res?.data?.status == "success") {
          toast.success(res?.data?.message);
          axios.get(BASE_URL + "/students/select_students.php");
          reset();
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setAddLoading(false);
      });

    // reset();
  };

  return (
    <div>
      <BreadCrumb title="Add Student" parent="Students" child="Add" />

      <Card className="!mt-5 !mb-5 !bg-transparent !border-0">
        {/* AntD Form بس للـlayout، الـsubmit جاي من RHF */}
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {/* Name */}
          <Form.Item
            label="Full Name"
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter student full name" />
              )}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email Address"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter student email" />
              )}
            />
          </Form.Item>

          {/* Country */}
          {/* <Form.Item
            label="Country"
            validateStatus={errors.country ? "error" : ""}
            help={errors.country?.message}
          >
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter country" />
              )}
            />
          </Form.Item> */}

          {/* Timezone */}
          {/* <Form.Item
            label="Timezone"
            validateStatus={errors.timezone ? "error" : ""}
            help={errors.timezone?.message}
          >
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select timezone"
                  showSearch
                  // important: AntD Select uses value/onChange, RHF field fits
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {timezoneOptions.map((tz) => (
                    <Option key={tz.value} value={tz.value}>
                      {tz.label}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item> */}

          {/* Password */}
          <Form.Item
            label="Password"
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Enter password" />
              )}
            />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            label="Phone Number"
            validateStatus={errors.phone ? "error" : ""}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter student phone number" />
              )}
            />
          </Form.Item>

          {/* Group */}
          {/* <Form.Item
            label="Group"
            validateStatus={errors.group ? "error" : ""}
            help={errors.group?.message}
          >
            <Controller
              name="group"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select group" allowClear>
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="C">C</Select.Option>
                </Select>
              )}
            />
          </Form.Item> */}

          {/* Level */}
          {/* <Form.Item
            label="Level"
            validateStatus={errors.level ? "error" : ""}
            help={errors.level?.message}
          >
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select level" allowClear>
                  <Select.Option value="beginner">Beginner</Select.Option>
                  <Select.Option value="intermediate">
                    Intermediate
                  </Select.Option>
                  <Select.Option value="hard">Hard</Select.Option>
                </Select>
              )}
            />
          </Form.Item> */}

          {/* Status */}
          {/* <Form.Item
            label="Status"
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              )}
            />
          </Form.Item> */}

          {/* Enrollment Date */}
          {/* <Form.Item
            label="Enrollment Date"
            validateStatus={errors.enrollmentDate ? "error" : ""}
            help={errors.enrollmentDate?.message}
          >
            <Controller
              name="enrollmentDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: "100%" }}
                  value={field.value}
                  onChange={(d) => field.onChange(d)}
                />
              )}
            />
          </Form.Item> */}

          {/* Submit */}
          <Form.Item className="text-right">
            <Button
              type="primary"
              htmlType="submit"
              loading={addLoading}
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
