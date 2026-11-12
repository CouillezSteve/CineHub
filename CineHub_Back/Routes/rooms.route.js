// Signé par : Gemini
import { Router } from "express";
import { 
  getRooms, 
  getRoomById, 
  createRoom, 
  updateRoom, 
  deleteRoom 
} from "../Controllers/rooms.controller.js";
import { checkToken } from "../Middlewares/auth.middleware.js";
import { checkAdmin } from "../Middlewares/admin.middleware.js";

const router = Router();

router.get("/", checkToken, getRooms);
router.get("/:id", checkToken, getRoomById);
router.post("/", checkToken, checkAdmin, createRoom);
router.patch("/:id", checkToken, checkAdmin, updateRoom);
router.delete("/:id", checkToken, checkAdmin, deleteRoom);

export default router;