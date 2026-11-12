import "dotenv/config";
import express from "express";
import authRoutes from "./Routes/auth.route.js";
import filmsRoutes from "./Routes/films.route.js";
import usersRoutes from "./Routes/users.route.js";
import roomsRoutes from "./Routes/rooms.route.js";
import screeningsRoutes from "./Routes/screenings.route.js";
import reservationsRoutes from "./Routes/reservations.route.js";
import { checkToken } from "./Middlewares/auth.middleware.js";

const app = express();
app.use(express.json());

// Routes publiques
app.get("/", (req, res) => {
  res.json({ status: "OK" });
});
app.use("/auth", authRoutes);

// Routes protégées (token obligatoire)
app.use("/films", checkToken, filmsRoutes);
app.use("/users", checkToken, usersRoutes);
app.use("/rooms", checkToken, roomsRoutes);
app.use("/screenings", checkToken, screeningsRoutes);
app.use("/reservations", checkToken, reservationsRoutes);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// Erreurs non gérées (JSON invalide, etc.)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") {
    return res.status(403).json({ error: "JSON invalide" });
  }
  res.status(500).json({ error: "Erreur serveur" });
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://127.0.0.1:${PORT}`);
});