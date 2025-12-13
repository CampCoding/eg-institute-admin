import * as yup from "yup";



const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm

export const addReservationSchema = yup.object({
  meeting_date: yup
    .string()
    .required("Meeting date is required")
    .matches(dateRegex, "Date must be YYYY-MM-DD")
    .test("not-in-past", "Date can't be in the past", (value) => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(`${value}T00:00:00`);
      return d >= today;
    }),

  meeting_time: yup
    .string()
    .required("Meeting time is required")
    .matches(timeRegex, "Time must be HH:mm"),
});
