// Fetch full recipe details by ID
export async function fetchSpoonacularRecipeDetails(id) {
  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recipe details');
  return await res.json();
}
// Utility to search recipes from Spoonacular API
// Usage: import { searchSpoonacularRecipes } from './spoonacularAPI';

const SPOONACULAR_API_KEY = 'f750c2cab2c543658feaa0b4aeffa9a6'; 
const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';

export async function searchSpoonacularRecipes(query) {
  const url = `${BASE_URL}?query=${encodeURIComponent(query)}&number=10&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  const data = await res.json();
  return data.results || [];
}
