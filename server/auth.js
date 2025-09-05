import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Change to env var in production
let users = [];

// Register endpoint
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { email, password: hashedPassword };
  users.push(user);
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
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
