import {
  getAllScreenings,
  getScreeningsByFilm,
  getScreeningById,
  createScreening,
  updateScreening,
  deleteScreening,
} from "../Models/screenings.model.js";

export const getScreenings = async (req, res) => {
  try {
    res.json(await getAllScreenings());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getFilmScreenings = async (req, res) => {
  try {
    res.json(await getScreeningsByFilm(req.params.filmID));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getScreening = async (req, res) => {
  try {
    const screening = await getScreeningById(req.params.id);
    if (!screening) {
      return res.status(404).json({ message: "Séance introuvable" });
    }
    res.json(screening);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const addScreening = async (req, res) => {
  try {
    const { film, room, datetime, price } = req.body ?? {};
    if (!film || !room || !datetime || price === undefined || price === null) {
      return res.status(403).json({ message: "Champs manquants" });
    }
    const result = await createScreening(req.body);
    const screening = await getScreeningById(result.insertId);
    res.status(201).json({ message: "Séance créée", screening });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const patchScreening = async (req, res) => {
  try {
    const screening = await getScreeningById(req.params.id);
    if (!screening) {
      return res.status(404).json({ message: "Séance introuvable" });
    }
    await updateScreening(req.params.id, req.body ?? {});
    const updated = await getScreeningById(req.params.id);
    res.json({ message: "Séance modifiée", screening: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const removeScreening = async (req, res) => {
  try {
    const result = await deleteScreening(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Séance introuvable" });
    }
    res.json({ message: "Séance supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};