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

export const getAllUsers = async () => {
  const [rows] = await pool.query(
    "SELECT us_id, us_username, us_email, us_role FROM users"
  );
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT us_id, us_username, us_email, us_role FROM users WHERE us_id = ?",
    [id]
  );
  return rows[0];
};

export const getPasswordHashById = async (id) => {
  const [rows] = await pool.query(
    "SELECT us_password FROM users WHERE us_id = ?",
    [id]
  );
  return rows[0]?.us_password;
};

export const updateUser = async (id, username, email, hashedPassword) => {
  const [result] = await pool.query(
    `UPDATE users
     SET us_username = COALESCE(?, us_username),
         us_email = COALESCE(?, us_email),
         us_password = COALESCE(?, us_password)
     WHERE us_id = ?`,
    [username ?? null, email ?? null, hashedPassword ?? null, id]
  );
  return result;
};

export const deleteUser = async (id) => {
  const [result] = await pool.query("DELETE FROM users WHERE us_id = ?", [id]);
  return result;
};