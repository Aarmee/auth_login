import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' }); // Load variables from .env

const JWT_SECRET = process.env.JWT_SECRET;
let db;

// Passport setup
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

async function startServer() {
  const app = express();
  app.use(express.json());

  app.use(session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // MySQL connection
  try {
    console.log('🔌 Connecting to MySQL database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    });
    
    // Test the connection
    const [testResult] = await db.query('SELECT 1 as test');
    console.log('✅ MySQL connection successful:', testResult[0]);
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    throw err;
  }

  // Create users table if it doesn't exist
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        full_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database table initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const full_name = profile.displayName;
    try {
      console.log('🔍 Checking user in database:', email);
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      let user;
      if (rows.length) {
        user = rows[0];
        console.log('✅ User found:', user.email);
      } else {
        console.log('➕ Creating new user:', email);
        await db.query('INSERT INTO users (email, full_name) VALUES (?, ?)', [email, full_name]);
        const [newRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        user = newRows[0];
        console.log('✅ New user created:', user.email);
      }
      return done(null, user);
    } catch (err) {
      console.error('❌ Google OAuth database error:', err.message);
      return done(err, null);
    }
  }));

  // Google OAuth Routes
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/dashboard' }),
    
    (req, res) => {
      console.log('🟢 Google callback success:', req.user);
      const user = req.user;
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      // ✅ Redirect to frontend google-success page with token + email
      res.redirect(`http://localhost:5173/google-success?token=${token}&email=${user.email}`);
    }
  );

  // Register route
  app.post('/api/register', async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)', [email, hashedPassword, full_name]);
      res.json({ message: 'User registered successfully' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login route
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Protected route
  app.get('/api/protected', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ message: 'Protected data', user: decoded });
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // User profile route
  app.get('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Get user data from database
      const [rows] = await db.query('SELECT id, email, full_name, created_at FROM users WHERE id = ?', [decoded.id]);
      if (!rows.length) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user: rows[0] });
    } catch (err) {
      console.error('❌ User profile error:', err.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // Root route
  app.get('/', (req, res) => {
    res.send('User Authentication API is running.');
  });

  // Start server
  app.listen(5000, () => {
    console.log('✅ Backend running on http://localhost:5000');
  });
}

startServer();
