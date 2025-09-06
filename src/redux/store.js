import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './recipesSlice';
import mealPlanReducer from './mealPlanSlice';

const store = configureStore({
  reducer: {
  recipes: recipesReducer,
  mealPlan: mealPlanReducer,
  },
});

export default store;
