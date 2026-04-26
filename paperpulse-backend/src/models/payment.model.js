const pool = require("../config/db");

const createPayment = async (paper_id, user_id, amount = 0) => {
  const result = await pool.query(
    `INSERT INTO payments (paper_id, user_id, amount, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (paper_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [paper_id, user_id, amount]
  );
  return result.rows[0];
};

const getPaymentByPaper = async (paper_id) => {
  const result = await pool.query(
    "SELECT * FROM payments WHERE paper_id = $1",
    [paper_id]
  );
  return result.rows[0];
};

const updatePaymentStatus = async (paper_id, status) => {
  const result = await pool.query(
    `UPDATE payments 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE paper_id = $2
     RETURNING *`,
    [status, paper_id]
  );
  return result.rows[0];
};

module.exports = {
  createPayment,
  getPaymentByPaper,
  updatePaymentStatus
};
