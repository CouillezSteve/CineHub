// Liste tous les utilisateurs (Admin)
export const getAllUsers = async (req, res) => {
  try {
    return res.status(501).json({ message: "Non implémenté" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Profil de l'utilisateur connecté (req.user)
export const getMe = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Détail d'un utilisateur par son ID
export const getUserById = async (req, res) => {
  try {
    return res.status(501).json({ message: "Non implémenté" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Modifier un utilisateur
export const updateUser = async (req, res) => {
  try {
    return res.status(501).json({ message: "Non implémenté" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Supprimer un utilisateur (Admin)
export const deleteUser = async (req, res) => {
  try {
    return res.status(501).json({ message: "Non implémenté" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};