import { Router } from "express";
import { checkAdmin } from "../Middlewares/admin.middleware.js";
import {
  getFilms,
  getShowing,
  getFilm,
  addFilm,
  patchFilm,
  removeFilm,
} from "../Controllers/films.controller.js";

const router = Router();

router.get("/", getFilms);
router.get("/showing", getShowing);   // AVANT /:id
router.get("/:id", getFilm);
router.post("/", checkAdmin, addFilm);
router.patch("/:id", checkAdmin, patchFilm);
router.delete("/:id", checkAdmin, removeFilm);

export default router;