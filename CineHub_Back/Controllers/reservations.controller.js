import {
  getAllReservations,
  getReservationsByUser,
  getReservationsByScreening,
  getReservationById,
  getScreeningAvailability,
  createReservation,
  deleteReservation,
} from "../Models/reservations.model.js";

export const listReservations = async (req, res) => {
  try {
    res.json(await getAllReservations());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const myReservations = async (req, res) => {
  try {
    res.json(await getReservationsByUser(req.user.us_id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const screeningReservations = async (req, res) => {
  try {
    res.json(await getReservationsByScreening(req.params.screeningID));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const addReservation = async (req, res) => {
  try {
    const { screening, seats = 1 } = req.body ?? {};

    if (!screening) {
      return res.status(403).json({ error: "Champs manquants" });
    }
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(403).json({ error: "Nombre de places invalide" });
    }

    const availability = await getScreeningAvailability(screening);
    if (!availability) {
      return res.status(404).json({ error: "Séance introuvable" });
    }

    if (Number(availability.reserved) + seats > availability.ro_capacity) {
      return res.status(403).json({ error: "Plus assez de places disponibles" });
    }

    const result = await createReservation(req.user.us_id, screening, seats);
    const reservation = await getReservationById(result.insertId);
    res.status(201).json({ message: "Réservation créée", reservation });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(500).json({ error: "Séance déjà réservée par cet utilisateur" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const removeReservation = async (req, res) => {
  try {
    const reservation = await getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }

    const isOwner = reservation.re_user === req.user.us_id;
    const isAdmin = req.user.us_role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await deleteReservation(req.params.id);
    res.json({ message: "Réservation annulée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};