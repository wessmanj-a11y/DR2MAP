import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(helmet());
app.use(cors());
app.use(express.json());

const demoUser = {
  username: process.env.DEMO_USERNAME || 'pilot',
  password: process.env.DEMO_PASSWORD || 'DR2MAP2026!'
};

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', platform: 'DR2MAP', mode: 'sandbox' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === demoUser.username && password === demoUser.password) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, user: { username, role: 'admin' } });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/dashboard', authMiddleware, (_, res) => {
  res.json({
    summary: {
      totalCustomersOut: 148223,
      severeCounties: 12,
      activeWeatherAlerts: 34,
      gridStatus: 'Elevated Risk'
    },
    counties: [
      { name: 'Dallas', risk: 78, outages: 25200, trend: 'Worsening' },
      { name: 'Collin', risk: 69, outages: 14300, trend: 'Elevated' },
      { name: 'Tarrant', risk: 74, outages: 19450, trend: 'Worsening' },
      { name: 'Rockwall', risk: 61, outages: 4200, trend: 'Stable' }
    ]
  });
});

app.listen(PORT, () => console.log(`DR2MAP server running on port ${PORT}`));
