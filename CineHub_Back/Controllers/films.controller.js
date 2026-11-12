import {
  getAllFilms,
  getShowingFilms,
  getFilmById,
  getUpcomingScreenings,
  createFilm,
  updateFilm,
  deleteFilm,
} from "../Models/films.model.js";

export const getFilms = async (req, res) => {
  try {
    res.json(await getAllFilms());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getShowing = async (req, res) => {
  try {
    res.json(await getShowingFilms());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getFilm = async (req, res) => {
  try {
    const film = await getFilmById(req.params.id);
    if (!film) {
      return res.status(404).json({ error: "Film introuvable" });
    }
    const screenings = await getUpcomingScreenings(film.fi_id);
    res.json({ ...film, screenings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const addFilm = async (req, res) => {
  try {
    const { title, duration } = req.body ?? {};
    if (!title || !duration) {
      return res.status(403).json({ error: "Champs manquants" });
    }
    const result = await createFilm(req.body);
    const film = await getFilmById(result.insertId);
    res.status(201).json({ message: "Film créé", film });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const patchFilm = async (req, res) => {
  try {
    const film = await getFilmById(req.params.id);
    if (!film) {
      return res.status(404).json({ error: "Film introuvable" });
    }
    await updateFilm(req.params.id, req.body ?? {});
    const updated = await getFilmById(req.params.id);
    res.json({ message: "Film modifié", film: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const removeFilm = async (req, res) => {
  try {
    const result = await deleteFilm(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Film introuvable" });
    }
    res.json({ message: "Film supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};