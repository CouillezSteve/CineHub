// Signé par : Gemini
import { Router } from "express";
import {
  getAllUsers,
  getMe,
  getUserById,
  updateUser,
  deleteUser,
} from "../Controllers/users.controller.js";
import { checkToken } from "../Middlewares/auth.middleware.js";
import { checkAdmin } from "../Middlewares/admin.middleware.js";

const router = Router();

router.get("/", checkToken, checkAdmin, getAllUsers);
router.get("/me", checkToken, getMe);
router.get("/:id", checkToken, getUserById);
router.patch("/:id", checkToken, updateUser);
router.delete("/:id", checkToken, checkAdmin, deleteUser);

export default router;