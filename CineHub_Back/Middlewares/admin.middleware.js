export const checkAdmin = (req, res, next) => {
  if (req.user?.us_role !== "admin") {
    return res.status(403).json({ error: "Accès réservé aux administrateurs" });
  }
  next();
};