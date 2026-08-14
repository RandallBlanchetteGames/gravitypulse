import pg from 'pg';
const { Pool } = pg;

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  console.warn('[DB] WARNING: DATABASE_URL not set. Database functionality (auth/stats) will be disabled.');
}

export async function initDB() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stats (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_games_played INTEGER DEFAULT 0,
        total_rounds_played INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_cumulative_points INTEGER DEFAULT 0,
        total_cumulative_deaths INTEGER DEFAULT 0,
        players_destroyed INTEGER DEFAULT 0,
        kamikazes INTEGER DEFAULT 0,
        asteroids_destroyed INTEGER DEFAULT 0,
        times_drifted_into_void INTEGER DEFAULT 0,
        times_crushed_by_asteroid INTEGER DEFAULT 0,
        times_sucked_into_black_hole INTEGER DEFAULT 0,
        times_overloaded INTEGER DEFAULT 0,
        times_cube_crashed INTEGER DEFAULT 0,
        times_supercharged INTEGER DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create a trigger function to auto-update updated_at on stats
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply the trigger to stats if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stats_updated_at') THEN
          CREATE TRIGGER update_stats_updated_at
            BEFORE UPDATE ON stats
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END
      $$;
    `);

    client.release();
    console.log('[DB] Database tables initialized successfully for Gravity Pulse.');
  } catch (err) {
    console.error('[DB] Error during initialization:', err);
  }
}

export { pool };
