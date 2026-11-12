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

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});