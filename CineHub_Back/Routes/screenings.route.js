import { Router } from "express";
import { checkAdmin } from "../Middlewares/admin.middleware.js";
import {
  getScreenings,
  getFilmScreenings,
  getScreening,
  addScreening,
  patchScreening,
  removeScreening,
} from "../Controllers/screenings.controller.js";

const router = Router();

router.get("/", getScreenings);
router.get("/film/:filmID", getFilmScreenings);   // AVANT /:id
router.get("/:id", getScreening);
router.post("/", checkAdmin, addScreening);
router.patch("/:id", checkAdmin, patchScreening);
router.delete("/:id", checkAdmin, removeScreening);

export default router;