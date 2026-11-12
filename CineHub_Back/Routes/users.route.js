import { Router } from "express";
import { checkAdmin } from "../Middlewares/admin.middleware.js";
import {
  listUsers,
  getMe,
  getUser,
  patchUser,
  removeUser,
} from "../Controllers/users.controller.js";

const router = Router();

router.get("/", checkAdmin, listUsers);
router.get("/me", getMe);            // AVANT /:id
router.get("/:id", getUser);
router.patch("/:id", patchUser);
router.delete("/:id", checkAdmin, removeUser);

export default router;