const authService = require('../services/authService');

async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const user = await authService.createUser({ name, email, password });
    const token = authService.generateToken(user);
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Failed to create user' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await authService.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await authService.validatePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = authService.generateToken(user);
    return res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { signup, login };
