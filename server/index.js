import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initDB, pool } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-gravity-pulse-key-2026';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, nickname',
      [username, hash]
    );

    const user = result.rows[0];
    
    // Initialize stats row for the new user
    await pool.query('INSERT INTO stats (user_id) VALUES ($1)', [user.id]);

    const token = jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT id, username, nickname, password_hash FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/auth/nickname', authenticateToken, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  const { nickname } = req.body;
  
  if (!nickname) return res.status(400).json({ error: 'Nickname required' });
  
  try {
    await pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [nickname, req.user.id]);
    res.json({ success: true, nickname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating nickname' });
  }
});

// --- STATS ROUTES ---

app.post('/api/stats/update', authenticateToken, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  const { matchStats } = req.body;
  const userId = req.user.id;

  if (!matchStats) return res.status(400).json({ error: 'Missing matchStats data' });

  try {
    await pool.query(`
      UPDATE stats SET
        total_games_played = total_games_played + 1,
        total_rounds_played = total_rounds_played + COALESCE($1, 0),
        total_wins = total_wins + COALESCE($2, 0),
        total_cumulative_points = total_cumulative_points + COALESCE($3, 0),
        total_cumulative_deaths = total_cumulative_deaths + COALESCE($4, 0),
        players_destroyed = players_destroyed + COALESCE($5, 0),
        kamikazes = kamikazes + COALESCE($6, 0),
        asteroids_destroyed = asteroids_destroyed + COALESCE($7, 0),
        times_drifted_into_void = times_drifted_into_void + COALESCE($8, 0),
        times_crushed_by_asteroid = times_crushed_by_asteroid + COALESCE($9, 0),
        times_sucked_into_black_hole = times_sucked_into_black_hole + COALESCE($10, 0),
        times_overloaded = times_overloaded + COALESCE($11, 0),
        times_cube_crashed = times_cube_crashed + COALESCE($12, 0),
        times_supercharged = times_supercharged + COALESCE($13, 0)
      WHERE user_id = $14
    `, [
      matchStats.rounds_played || 0,
      matchStats.win ? 1 : 0,
      matchStats.points || 0,
      matchStats.deaths || 0,
      matchStats.players_destroyed || 0,
      matchStats.kamikazes || 0,
      matchStats.asteroids_destroyed || 0,
      matchStats.times_drifted_into_void || 0,
      matchStats.times_crushed_by_asteroid || 0,
      matchStats.times_sucked_into_black_hole || 0,
      matchStats.times_overloaded || 0,
      matchStats.times_cube_crashed || 0,
      matchStats.times_supercharged || 0,
      userId
    ]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating stats' });
  }
});

app.get('/api/stats/profile/:id', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT u.username, u.nickname, s.*
      FROM stats s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

app.get('/api/stats/leaderboard', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  
  try {
    // We'll return the full list of users and their stats.
    // The frontend can sort and determine the #1 spots for various categories.
    const result = await pool.query(`
      SELECT u.username, u.nickname, u.id as user_id, s.*
      FROM stats s
      JOIN users u ON u.id = s.user_id
      WHERE s.total_games_played > 0
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Gravity Pulse backend running on port ${PORT}`);
});

initDB().then(() => {
  console.log('[Server] Database initialization completed');
}).catch(err => {
  console.error('[Server] Failed to initialize database:', err);
});
