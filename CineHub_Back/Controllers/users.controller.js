import bcrypt from "bcrypt";
import {
  getAllUsers,
  getUserById,
  getPasswordHashById,
  updateUser,
  deleteUser,
} from "../Models/users.model.js";

export const listUsers = async (req, res) => {
  try {
    res.json(await getAllUsers());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getMe = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const patchUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isSelf = req.user.us_id === id;
    const isAdmin = req.user.us_role === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { username, email, password, current_password } = req.body ?? {};
    if (!username && !email && !password) {
      return res.status(403).json({ error: "Aucun champ à modifier" });
    }

    // Changement de mot de passe (en plus de username / email)
    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        return res
          .status(403)
          .json({ error: "Mot de passe trop court (6 caractères minimum)" });
      }
      // Pour changer son propre mot de passe, il faut fournir l'actuel
      if (isSelf) {
        if (!current_password) {
          return res.status(403).json({ error: "Mot de passe actuel requis" });
        }
        const currentHash = await getPasswordHashById(id);
        if (!currentHash || !bcrypt.compareSync(current_password, currentHash)) {
          return res.status(403).json({ error: "Mot de passe actuel incorrect" });
        }
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await updateUser(id, username, email, hashedPassword);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(await getUserById(id));
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(500).json({ error: "Nom d'utilisateur ou email déjà utilisé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const removeUser = async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};