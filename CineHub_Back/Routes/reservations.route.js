import { Router } from "express";
import { checkAdmin } from "../Middlewares/admin.middleware.js";
import {
  listReservations,
  myReservations,
  screeningReservations,
  addReservation,
  removeReservation,
} from "../Controllers/reservations.controller.js";

const router = Router();

router.get("/", checkAdmin, listReservations);
router.get("/me", myReservations);
router.get("/screening/:screeningID", checkAdmin, screeningReservations);
router.post("/", addReservation);
router.delete("/:id", removeReservation);

export default router;