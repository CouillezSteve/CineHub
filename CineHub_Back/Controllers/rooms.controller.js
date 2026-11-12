import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../Models/rooms.model.js";

export const getRooms = async (req, res) => {
  try {
    res.json(await getAllRooms());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const addRoom = async (req, res) => {
  try {
    const { name, capacity } = req.body ?? {};
    if (!name || !capacity) {
      return res.status(403).json({ message: "Champs manquants" });
    }
    const result = await createRoom(req.body);
    const room = await getRoomById(result.insertId);
    res.status(201).json({ message: "Salle créée", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const patchRoom = async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    await updateRoom(req.params.id, req.body ?? {});
    const updated = await getRoomById(req.params.id);
    res.json({ message: "Salle modifiée", room: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const removeRoom = async (req, res) => {
  try {
    const result = await deleteRoom(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    res.json({ message: "Salle supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};