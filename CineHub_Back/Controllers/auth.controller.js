import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByUsername } from "../Models/users.model.js";

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

export const login = async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(403).json({ message: "Champs manquants" });
    }

    const user = await findUserByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.us_password)) {
      return res.status(403).json({ message: "Identifiants incorrects" });
    }

    const token = jwt.sign(
      {
        us_id: user.us_id,
        us_username: user.us_username,
        us_email: user.us_email,
        us_role: user.us_role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Connexion réussie", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};