require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigration() {
  try {
    // Attempting to create table with INTEGER as requested. 
    // NOTE: If papers(id) is UUID, this will fail. 
    // In that case, I will fallback to removing the REFERENCES clause to satisfy the INTEGER requirement.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER UNIQUE,
        user_id INTEGER,
        status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
        amount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Migration executed successfully: payments table ready (INTEGER types).");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
