const pool = require("../config/db");

// Create user
const createUser = async (name, email, passwordHash, role) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, passwordHash, role]
  );
  return result.rows[0];
};

// Find user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail
};