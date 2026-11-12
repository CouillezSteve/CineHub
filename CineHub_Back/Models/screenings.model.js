import { pool } from "../Config/db.js";

const SELECT_SCREENINGS = `
  SELECT s.sc_id, s.sc_film, f.fi_title, s.sc_room, r.ro_name, s.sc_datetime, s.sc_price
  FROM screenings s
  JOIN films f ON f.fi_id = s.sc_film
  JOIN rooms r ON r.ro_id = s.sc_room
`;

export const getAllScreenings = async () => {
  const [rows] = await pool.query(`${SELECT_SCREENINGS} ORDER BY s.sc_datetime`);
  return rows;
};

export const getScreeningsByFilm = async (filmId) => {
  const [rows] = await pool.query(
    `${SELECT_SCREENINGS} WHERE s.sc_film = ? ORDER BY s.sc_datetime`,
    [filmId]
  );
  return rows;
};

export const getScreeningById = async (id) => {
  const [rows] = await pool.query(`${SELECT_SCREENINGS} WHERE s.sc_id = ?`, [id]);
  return rows[0];
};

export const createScreening = async ({ film, room, datetime, price }) => {
  const [result] = await pool.query(
    "INSERT INTO screenings (sc_film, sc_room, sc_datetime, sc_price) VALUES (?, ?, ?, ?)",
    [film, room, datetime, price]
  );
  return result;
};

export const updateScreening = async (id, { film, room, datetime, price }) => {
  const [result] = await pool.query(
    `UPDATE screenings SET
       sc_film = COALESCE(?, sc_film),
       sc_room = COALESCE(?, sc_room),
       sc_datetime = COALESCE(?, sc_datetime),
       sc_price = COALESCE(?, sc_price)
     WHERE sc_id = ?`,
    [film ?? null, room ?? null, datetime ?? null, price ?? null, id]
  );
  return result;
};

export const deleteScreening = async (id) => {
  const [result] = await pool.query("DELETE FROM screenings WHERE sc_id = ?", [id]);
  return result;
};