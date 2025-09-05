import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRecipes, addRecipeAPI, editRecipeAPI, deleteRecipeAPI } from './recipesAPI';

export const getRecipes = createAsyncThunk('recipes/getRecipes', async () => {
  return await fetchRecipes();
});

export const addRecipe = createAsyncThunk('recipes/addRecipe', async (recipe) => {
  return await addRecipeAPI(recipe);
});

export const editRecipe = createAsyncThunk('recipes/editRecipe', async ({ id, updatedRecipe }) => {
  return await editRecipeAPI(id, updatedRecipe);
});

export const deleteRecipe = createAsyncThunk('recipes/deleteRecipe', async (id) => {
  await deleteRecipeAPI(id);
  return id;
});

const initialState = {
  recipes: [],
  status: 'idle',
  error: null,
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearRecipes: (state) => {
      state.recipes = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getRecipes.pending, state => {
        state.status = 'loading';
      })
      .addCase(getRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recipes = action.payload;
      })
      .addCase(getRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.recipes.push(action.payload);
      })
      .addCase(editRecipe.fulfilled, (state, action) => {
        const index = state.recipes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearRecipes } = recipesSlice.actions;
export default recipesSlice.reducer;
