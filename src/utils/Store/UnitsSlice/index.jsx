import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unit: null,
};

const unitsSlice = createSlice({
  name: "Units",
  initialState,
  reducers: {
    setUnit: (state, action) => {
      state.unit = action.payload;
    },
    clearUnit: (state) => {
      state.unit = null;
    },
  },
});

export const { setUnit, clearUnit } = unitsSlice.actions;
export default unitsSlice;
