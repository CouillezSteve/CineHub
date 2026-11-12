import { getAllFilms } from "../Models/films.model.js";

export const getFilms = async (req, res) => {
  try {
    const films = await getAllFilms();
    res.json(films);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};