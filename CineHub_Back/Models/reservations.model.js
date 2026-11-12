import { pool } from "../Config/db.js";

export const getAllReservations = async () => {
  const [rows] = await pool.query(
    `SELECT re.re_id, re.re_user, u.us_username, re.re_screening, re.re_seats, re.re_created_at,
            f.fi_title, s.sc_datetime, r.ro_name, s.sc_price
     FROM reservations re
     JOIN users u ON u.us_id = re.re_user
     JOIN screenings s ON s.sc_id = re.re_screening
     JOIN films f ON f.fi_id = s.sc_film
     JOIN rooms r ON r.ro_id = s.sc_room
     ORDER BY re.re_created_at DESC`
  );
  return rows;
};

export const getReservationsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT re.re_id, re.re_seats, f.fi_title, s.sc_datetime, r.ro_name, s.sc_price
     FROM reservations re
     JOIN screenings s ON s.sc_id = re.re_screening
     JOIN films f ON f.fi_id = s.sc_film
     JOIN rooms r ON r.ro_id = s.sc_room
     WHERE re.re_user = ?
     ORDER BY s.sc_datetime`,
    [userId]
  );
  return rows;
};

export const getReservationsByScreening = async (screeningId) => {
  const [rows] = await pool.query(
    `SELECT re.re_id, re.re_user, u.us_username, re.re_seats, re.re_created_at
     FROM reservations re
     JOIN users u ON u.us_id = re.re_user
     WHERE re.re_screening = ?`,
    [screeningId]
  );
  return rows;
};

export const getReservationById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM reservations WHERE re_id = ?", [id]);
  return rows[0];
};

// Capacité de la salle + places déjà réservées pour une séance
export const getScreeningAvailability = async (screeningId) => {
  const [rows] = await pool.query(
    `SELECT s.sc_id, r.ro_capacity,
            COALESCE((SELECT SUM(re.re_seats) FROM reservations re WHERE re.re_screening = s.sc_id), 0) AS reserved
     FROM screenings s
     JOIN rooms r ON r.ro_id = s.sc_room
     WHERE s.sc_id = ?`,
    [screeningId]
  );
  return rows[0];
};

export const createReservation = async (userId, screeningId, seats) => {
  const [result] = await pool.query(
    "INSERT INTO reservations (re_user, re_screening, re_seats) VALUES (?, ?, ?)",
    [userId, screeningId, seats]
  );
  return result;
};

export const deleteReservation = async (id) => {
  const [result] = await pool.query("DELETE FROM reservations WHERE re_id = ?", [id]);
  return result;
};