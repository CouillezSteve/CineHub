import { Router } from "express";
import { getFilms } from "../Controllers/films.controller.js";

const router = Router();

router.get("/", getFilms);

export default router;