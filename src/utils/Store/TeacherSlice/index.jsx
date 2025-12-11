import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  TeacherSlots: null,
  teacher: null,
};

const teacherSlice = createSlice({
  name: "Teacher",
  initialState,
  reducers: {
    setSlots: (state, action) => {
      state.TeacherSlots = action.payload;
    },
    clearTeacherSlots: (state) => {
      state.TeacherSlots = null;
    },
    setTeacher: (state, action) => {
      state.teacher = action.payload;
    },
    clearTeacher: (state) => {
      state.teacher = null;
    },
  },
});

export const { setSlots, clearTeacherSlots, setTeacher, clearTeacher } =
  teacherSlice.actions;
export default teacherSlice;
