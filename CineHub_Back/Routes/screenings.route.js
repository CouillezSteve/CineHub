// Signé par : Gemini
import { Router } from "express";
import { 
  getScreenings, 
  getScreeningsByFilm, 
  getScreeningById, 
  createScreening, 
  updateScreening, 
  deleteScreening 
} from "../Controllers/screenings.controller.js";
import { checkToken } from "../Middlewares/auth.middleware.js";
import { checkAdmin } from "../Middlewares/admin.middleware.js";

const router = Router();

router.get("/", checkToken, getScreenings);
router.get("/film/:filmID", checkToken, getScreeningsByFilm);
router.get("/:id", checkToken, getScreeningById);
router.post("/", checkToken, checkAdmin, createScreening);
router.patch("/:id", checkToken, checkAdmin, updateScreening);
router.delete("/:id", checkToken, checkAdmin, deleteScreening);

export default router;