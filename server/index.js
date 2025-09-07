
// ...existing code (keep only one set of imports, app, PORT, userRecipes, and favorite route)...
import express from 'express';
import multer from 'multer';
import cors from 'cors';

import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import authRouter from './auth.js';
import authMiddleware from './authMiddleware.js';
const app = express();

// --- CORS config: must be first ---
const allowedOrigins = [
  'https://recipe-tracker-eosin.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://recipe-tracker-1-lqbn.onrender.com',
  'https://recipe-tracker-4xjvl12d-jtvnns-projects.vercel.app'
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}));
// Catch-all OPTIONS for preflight

// --- End CORS config ---

const upload = multer({ dest: path.join(__dirname, 'uploads') });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use('/auth', authRouter);
// Image upload endpoint
app.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
const PORT = 4000;


// Store recipes per user: { [email]: [recipe, ...] }
let userRecipes = {};
// Store meal plans per user: { [email]: { [day]: [recipeId, ...] } }
let userMealPlans = {};

// File-based persistence for meal plans
const MEALPLANS_FILE = path.join(__dirname, 'mealplans.json');

async function readMealPlans() {
  try {
    const data = await fs.readFile(MEALPLANS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeMealPlans(plans) {
  await fs.writeFile(MEALPLANS_FILE, JSON.stringify(plans, null, 2));
}

// Load meal plans on server start
readMealPlans().then(plans => { userMealPlans = plans; });
// Get meal plan for user
app.get('/mealplan', authMiddleware, async (req, res) => {
  const email = req.user.email;
  // Always read latest from disk in case of multi-process
  const plans = await readMealPlans();
  userMealPlans = plans;
  res.json(userMealPlans[email] || {});
});

// Save meal plan for user
app.post('/mealplan', authMiddleware, async (req, res) => {
  const email = req.user.email;
  const { plan } = req.body;
  userMealPlans[email] = plan;
  await writeMealPlans(userMealPlans);
  res.json({ success: true });
});

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

// ...existing code...
// Toggle favorite status for a recipe (must be after app and userRecipes are defined)
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
