import { pool } from "../Config/db.js";

export const getAllRooms = async () => {
  const [rows] = await pool.query("SELECT * FROM rooms");
  return rows;
};

export const getRoomById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM rooms WHERE ro_id = ?", [id]);
  return rows[0];
};

export const createRoom = async ({ name, capacity }) => {
  const [result] = await pool.query(
    "INSERT INTO rooms (ro_name, ro_capacity) VALUES (?, ?)",
    [name, capacity]
  );
  return result;
};

export const updateRoom = async (id, { name, capacity }) => {
  const [result] = await pool.query(
    `UPDATE rooms SET
       ro_name = COALESCE(?, ro_name),
       ro_capacity = COALESCE(?, ro_capacity)
     WHERE ro_id = ?`,
    [name ?? null, capacity ?? null, id]
  );
  return result;
};

export const deleteRoom = async (id) => {
  const [result] = await pool.query("DELETE FROM rooms WHERE ro_id = ?", [id]);
  return result;
};