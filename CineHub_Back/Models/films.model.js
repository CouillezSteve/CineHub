import { pool } from "../Config/db.js";

export const getAllFilms = async () => {
  const [rows] = await pool.query("SELECT * FROM films");
  return rows;
};

export const getShowingFilms = async () => {
  const [rows] = await pool.query("SELECT * FROM films WHERE fi_is_showing = 1");
  return rows;
};

export const getFilmById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM films WHERE fi_id = ?", [id]);
  return rows[0];
};

export const getUpcomingScreenings = async (filmId) => {
  const [rows] = await pool.query(
    `SELECT s.sc_id, s.sc_datetime, s.sc_price, r.ro_id, r.ro_name
     FROM screenings s
     JOIN rooms r ON r.ro_id = s.sc_room
     WHERE s.sc_film = ? AND s.sc_datetime > NOW()
     ORDER BY s.sc_datetime`,
    [filmId]
  );
  return rows;
};

export const createFilm = async ({ title, description, duration, genre, release_date, is_showing }) => {
  const [result] = await pool.query(
    `INSERT INTO films (fi_title, fi_description, fi_duration, fi_genre, fi_release_date, fi_is_showing)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description ?? null, duration, genre ?? null, release_date ?? null, is_showing ?? true]
  );
  return result;
};

export const updateFilm = async (id, { title, description, duration, genre, release_date, is_showing }) => {
  const [result] = await pool.query(
    `UPDATE films SET
       fi_title = COALESCE(?, fi_title),
       fi_description = COALESCE(?, fi_description),
       fi_duration = COALESCE(?, fi_duration),
       fi_genre = COALESCE(?, fi_genre),
       fi_release_date = COALESCE(?, fi_release_date),
       fi_is_showing = COALESCE(?, fi_is_showing)
     WHERE fi_id = ?`,
    [
      title ?? null,
      description ?? null,
      duration ?? null,
      genre ?? null,
      release_date ?? null,
      is_showing ?? null,
      id,
    ]
  );
  return result;
};

export const deleteFilm = async (id) => {
  const [result] = await pool.query("DELETE FROM films WHERE fi_id = ?", [id]);
  return result;
};