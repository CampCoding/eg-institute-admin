import { configureStore } from "@reduxjs/toolkit";
import teacherSlice from "./TeacherSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      Teacher: teacherSlice.reducer,
    },
  });

export const store = makeStore();
