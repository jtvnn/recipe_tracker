// recipesAPI.js
const API_URL = 'https://recipe-tracker-1-lqbn.onrender.com/recipes';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRecipes() {
  const res = await fetch(API_URL, {
    headers: { ...getAuthHeader() },
  });
  return res.json();
}

export async function addRecipeAPI(recipe) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(recipe),
  });
  return res.json();
}

export async function editRecipeAPI(id, updatedRecipe) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updatedRecipe),
  });
  return res.json();
}

export async function deleteRecipeAPI(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
}
