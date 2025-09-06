import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMealPlan, saveMealPlan } from './mealPlanAPI';

export const getMealPlan = createAsyncThunk('mealPlan/getMealPlan', async () => {
  return await fetchMealPlan();
});

export const setMealPlan = createAsyncThunk('mealPlan/setMealPlan', async (plan) => {
  await saveMealPlan(plan);
  return plan;
});

const initialState = {
  plan: {},
  status: 'idle',
  error: null,
};

export default function mealPlanReducer(state = initialState, action) {
  switch (action.type) {
    case getMealPlan.pending.type:
      return { ...state, status: 'loading' };
    case getMealPlan.fulfilled.type:
      return { ...state, status: 'succeeded', plan: action.payload };
    case getMealPlan.rejected.type:
      return { ...state, status: 'failed', error: action.error.message };
    case setMealPlan.fulfilled.type:
      return { ...state, plan: action.payload };
    default:
      return state;
  }
}
