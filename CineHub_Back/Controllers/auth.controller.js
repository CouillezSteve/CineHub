import bcrypt from "bcrypt";
import { createUser } from "../Models/users.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};

    if (!username || !email || !password) {
      return res.status(403).json({ message: "Champs manquants" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await createUser(username, email, hashedPassword);

    res.status(201).json({
      id: result.insertId,
      username,
      email,
      role: "user",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};