import { pool } from "../Config/db.js";

export const getAllFilms = async () => {
  const [rows] = await pool.query("SELECT * FROM films");
  return rows;
};