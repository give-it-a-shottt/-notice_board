const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Missing fields' });
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username taken' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' },
    );
    res.json({ user: { id: user._id, username: user.username }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Missing fields' });
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' },
    );
    res.json({ user: { id: user._id, username: user.username }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
