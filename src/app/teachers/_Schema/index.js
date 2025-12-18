import * as yup from "yup";
import moment from "moment";

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/; // "HH:mm" أو "HH:mm:ss"

export const teacherSchema = yup.object({
  // ... نفس الحقول اللي فوق

  teacher_slots: yup
    .array()
    .of(
      yup.object({
        day: yup
          .string()
          .oneOf(
            [
              "Saturday",
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            "Invalid day"
          )
          .required("Day is required"),

        slots_from: yup
          .string()
          .required("From is required")
          .matches(timeRegex, "Invalid time"),

        slots_to: yup
          .string()
          .required("To is required")
          .matches(timeRegex, "Invalid time")
          .test("after", "To must be after From", function (to) {
            const from = this.parent.slots_from;
            if (!from || !to) return true;

            const fromM = moment(from, "HH:mm:ss");
            const toM = moment(to, "HH:mm:ss");

            if (!fromM.isValid() || !toM.isValid()) return false;

            return toM.isAfter(fromM);
          }),
      })
    )
    .min(1, "Add at least 1 slot")
    .required(),
});
