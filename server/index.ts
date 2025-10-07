import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { InsertUser, InsertSession } from '../shared/schema';
import menuRoutes from './routes/menuRoutes'; // ✅ new import (make sure this file exists)

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 🔹 Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const token = req.cookies.sessionToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const sessionData = await storage.getSessionByToken(token);
    if (!sessionData) {
      res.clearCookie('sessionToken');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = sessionData.user;
    req.session = sessionData;
    next();
  } catch (error) {
    res.clearCookie('sessionToken');
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// 🔹 Helper function to create a new session
const createSession = async (userId: number, rememberMe: boolean = false) => {
  const expiresAt = new Date();
  if (rememberMe) expiresAt.setDate(expiresAt.getDate() + 30);
  else expiresAt.setHours(expiresAt.getHours() + 24);

  const sessionData: InsertSession = { userId, expiresAt, rememberMe };
  return await storage.createSession(sessionData);
};

// 🔹 Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'customer' } = req.body;

    const existingUserByEmail = await storage.getUserByEmail(email);
    const existingUserByUsername = await storage.getUserByUsername(username);

    if (existingUserByEmail) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    if (existingUserByUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData: InsertUser = {
      username,
      email,
      password: hashedPassword,
      role,
      approved: role === 'customer' ? true : false
    };

    const user = await storage.createUser(userData);

    if (role === 'customer') {
      const session = await createSession(user.id);
      res.cookie('sessionToken', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    const { password: _, ...userResponse } = user;
    res.status(201).json({ user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password, rememberMe = false } = req.body;
    let user = await storage.getUserByEmail(emailOrUsername);
    if (!user) user = await storage.getUserByUsername(emailOrUsername);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role === 'merchant' && !user.approved) {
      return res.status(403).json({ error: 'Account pending approval' });
    }

    const session = await createSession(user.id, rememberMe);
    res.cookie('sessionToken', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });

    const { password: _, ...userResponse } = user;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
  try {
    const token = req.cookies.sessionToken;
    if (token) await storage.deleteSession(token);
    res.clearCookie('sessionToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const { password: _, ...userResponse } = req.user;
  res.json({ user: userResponse });
});

// 🔹 Mount menu routes
app.use('/api/menu', menuRoutes); // ✅ this ensures your updated menu routes work

// 🔹 Clean up expired sessions every hour
setInterval(async () => {
  try {
    await storage.deleteExpiredSessions();
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}, 60 * 60 * 1000);

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
