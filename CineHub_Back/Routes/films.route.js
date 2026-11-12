// Signé par : Gemini
import { Router } from "express";
import {
  getFilms,
  getShowingFilms,
  getFilmById,
  createFilm,
  updateFilm,
  deleteFilm,
} from "../Controllers/films.controller.js";
import { checkToken } from "../Middlewares/auth.middleware.js";
import { checkAdmin } from "../Middlewares/admin.middleware.js";

const router = Router();

router.get("/", checkToken, getFilms);
router.get("/showing", checkToken, getShowingFilms);
router.get("/:id", checkToken, getFilmById);
router.post("/", checkToken, checkAdmin, createFilm);
router.patch("/:id", checkToken, checkAdmin, updateFilm);
router.delete("/:id", checkToken, checkAdmin, deleteFilm);

export default router;