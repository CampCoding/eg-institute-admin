import * as yup from "yup";

const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const teacherSchema = yup.object({
  name: yup.string().trim().required("Teacher name is required"),

  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),

  phone: yup
    .string()
    .trim()
    .required("Phone is required")
    .matches(/^\d{8,15}$/, "Phone must be 8–15 digits"),

  hourly_rate: yup
    .number()
    .typeError("Hourly rate must be a number")
    .positive("Hourly rate must be > 0")
    .required("Hourly rate is required"),

  photo: yup
    .string()
    .trim()
    .url("Invalid image URL")
    .required("Image is required"),

  title: yup.string().trim().required("Specialization is required"),

  summary: yup
    .string()
    .trim()
    .min(10, "Bio too short")
    .required("Bio is required"),

  // tags عندك array من Select mode="tags"
  tags: yup.array().of(yup.string().trim()).min(1, "Add at least 1 tag"),

  // Languages عندك array
  Languages: yup
    .array()
    .of(yup.string().trim())
    .min(1, "Add at least 1 language")
    .required(),

  country: yup.string().trim().required("Country is required"),
  TimeZone: yup.string().trim().required("Time zone is required"),

  // level عندك "Beginner" ... (Capitalized)
  level: yup
    .string()
    .oneOf(["Beginner", "Intermediate", "Expert"], "Invalid level")
    .required("Level is required"),

  // teacher_slots: هنا slots_from/slots_to Moment/Dayjs (مش string)
  teacher_slots: yup
    .array()
    .of(
      yup.object({
        day: yup
          .string()
          .oneOf(days, "Invalid day")
          .required("Day is required"),
        slots_from: yup.mixed().required("From is required"),
        slots_to: yup
          .mixed()
          .required("To is required")
          .test("after", "To must be after From", function (to) {
            const from = this.parent.slots_from;
            if (!from || !to) return true;
            return to.isAfter(from); // moment/dayjs
          }),
      })
    )
    .min(1, "Add at least 1 slot")
    .required(),
});
