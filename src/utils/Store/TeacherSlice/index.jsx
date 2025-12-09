import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  TeacherSlots: null,
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
  },
});

export const { setSlots, clearTeacherSlots } = teacherSlice.actions;
export default teacherSlice;
