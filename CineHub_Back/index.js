import "dotenv/config";
import express from "express";
import filmsRoutes from "./Routes/films.route.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API CineHub opérationnelle" });
});

app.use("/films", filmsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});