// src/redux/mealPlanAPI.js
const API_URL = 'https://recipe-tracker-1-lqbn.onrender.com/mealplan';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchMealPlan() {
  const res = await fetch(API_URL, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) return {};
  return res.json();
}

export async function saveMealPlan(plan) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ plan }),
  });
  return res.json();
}
