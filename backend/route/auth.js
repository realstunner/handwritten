// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure users.json exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper to read and write users
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE));
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// 🔐 POST /auth/register
router.post('/register', async (req, res) => {
  const { username, phone, email, password, signature } = req.body;
  if (!username || !phone || !email || !password || !signature) {
    return res.status(400).json({ message: "All fields required" });
  }

  const users = readUsers();
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(409).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), username, phone, email, password: hashedPassword, signature };
  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: "User registered successfully" });
});

// 🔓 POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ message: "Login successful", token });
});

module.exports = router;
