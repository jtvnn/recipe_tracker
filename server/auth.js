
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Change to env var in production
const USERS_FILE = path.resolve(process.cwd(), 'server', 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register endpoint
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  let users = await readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { email, password: hashedPassword };
  users.push(user);
  await writeUsers(users);
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = await readUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

export default router;
