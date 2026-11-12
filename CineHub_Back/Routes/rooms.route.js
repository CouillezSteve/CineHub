import { Router } from "express";
import { checkAdmin } from "../Middlewares/admin.middleware.js";
import {
  getRooms,
  getRoom,
  addRoom,
  patchRoom,
  removeRoom,
} from "../Controllers/rooms.controller.js";

const router = Router();

router.get("/", getRooms);
router.get("/:id", getRoom);
router.post("/", checkAdmin, addRoom);
router.patch("/:id", checkAdmin, patchRoom);
router.delete("/:id", checkAdmin, removeRoom);

export default router;