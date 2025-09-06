// Toggle favorite status for a recipe
app.patch('/recipes/:id/favorite', authMiddleware, (req, res) => {
  const email = req.user.email;
  const id = Number(req.params.id);
  const userList = userRecipes[email] || [];
  const index = userList.findIndex(r => r.id === id);
  if (index !== -1) {
    userList[index].favorite = !userList[index].favorite;
    res.json({ id, favorite: userList[index].favorite });
  } else {
    res.status(404).json({ error: 'Recipe not found' });
  }
});
import express from 'express';
import cors from 'cors';
import path from 'path';

import authRouter from './auth.js';
import authMiddleware from './authMiddleware.js';
const app = express();
const PORT = 4000;


app.use(cors({
  origin: 'https://recipe-tracker-eosin.vercel.app', // Updated to actual deployed Vercel frontend URL
  credentials: true
}));
app.use(express.json());
app.use('/auth', authRouter);

// Store recipes per user: { [email]: [recipe, ...] }
let userRecipes = {};

app.get('/recipes', authMiddleware, (req, res) => {
  const email = req.user.email;
  res.json(userRecipes[email] || []);
});

app.post('/recipes', authMiddleware, (req, res) => {
  const email = req.user.email;
  const recipe = req.body;
  recipe.id = Date.now();
  if (!userRecipes[email]) userRecipes[email] = [];
  userRecipes[email].push(recipe);
  res.status(201).json(recipe);
});

app.put('/recipes/:id', authMiddleware, (req, res) => {
  const email = req.user.email;
  const id = Number(req.params.id);
  const userList = userRecipes[email] || [];
  const index = userList.findIndex(r => r.id === id);
  if (index !== -1) {
    userList[index] = { ...userList[index], ...req.body };
    res.json(userList[index]);
  } else {
    res.status(404).json({ error: 'Recipe not found' });
  }
});

app.delete('/recipes/:id', authMiddleware, (req, res) => {
  const email = req.user.email;
  const id = Number(req.params.id);
  if (!userRecipes[email]) userRecipes[email] = [];
  userRecipes[email] = userRecipes[email].filter(r => r.id !== id);
  res.status(204).end();
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
