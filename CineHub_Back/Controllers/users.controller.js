import {
  getAllUsers,
  getUserById,
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

    const { username, email } = req.body ?? {};
    if (!username && !email) {
      return res.status(403).json({ error: "Aucun champ à modifier" });
    }

    const result = await updateUser(id, username, email);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(await getUserById(id));
  } catch (error) {
    console.error(error);
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