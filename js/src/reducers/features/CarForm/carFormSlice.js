// src/reducers/features/CarForm/carFormSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: {
    plant_code: '',
    sap_plant_code: '',
    dept: '',
    requester_name: '',
    budget_category: 'CAPEX',
    requirement_type: [],
    nature_of_asset: [],
    esg_impact_categories: [],
    // yahan tumhara baaki complete form structure aa jayega
  },
};

const carFormSlice = createSlice({
  name: 'carForm',
  initialState,
  reducers: {
    setField(state, action) {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },
    setForm(state, action) {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm(state) {
      state.formData = initialState.formData;
    },
  },
});

export const { setField, setForm, resetForm } = carFormSlice.actions;
export default carFormSlice.reducer;
