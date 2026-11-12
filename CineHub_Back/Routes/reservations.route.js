// Signé par : Gemini
import { Router } from "express";
import {
  getAllReservations,
  getMyReservations,
  getReservationsByScreening,
  createReservation,
  deleteReservation,
} from "../Controllers/reservations.controller.js";
import { checkToken } from "../Middlewares/auth.middleware.js";
import { checkAdmin } from "../Middlewares/admin.middleware.js";

const router = Router();

router.get("/", checkToken, checkAdmin, getAllReservations);
router.get("/me", checkToken, getMyReservations);
router.get("/screening/:screeningID", checkToken, checkAdmin, getReservationsByScreening);
router.post("/", checkToken, createReservation);
router.delete("/:id", checkToken, deleteReservation);

export default router;