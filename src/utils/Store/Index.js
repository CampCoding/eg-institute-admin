import { configureStore } from "@reduxjs/toolkit";
import teacherSlice from "./TeacherSlice";
import unitsSlice from "./UnitsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      Teacher: teacherSlice.reducer,
      Units: unitsSlice.reducer,
    },
  });

export const store = makeStore();
