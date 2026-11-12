import { pool } from "../Config/db.js";

export const createUser = async (username, email, hashedPassword) => {
  const [result] = await pool.query(
    "INSERT INTO users (us_username, us_email, us_password, us_role) VALUES (?, ?, ?, 'user')",
    [username, email, hashedPassword]
  );
  return result;
};

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE us_username = ?",
    [username]
  );
  return rows[0];
};