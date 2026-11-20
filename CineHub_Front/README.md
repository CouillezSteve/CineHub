# CineHub — Front (React + Vite + Bootstrap 5)

Interface web de CineHub. Elle consomme l'API du dossier `CineHub_Back`.

## Lancer le projet

1. Démarrer l'API (dans `CineHub_Back`, port 3000) :
   ```bash
   npm run dev
   ```
2. Dans ce dossier :
   ```bash
   npm install
   npm run dev
   ```
3. Ouvrir http://localhost:5173

`npm start` fait la même chose que `npm run dev`.

L'adresse de l'API est dans `src/api.js` (`http://127.0.0.1:3000` par défaut).
Pour la changer, copier `.env.example` en `.env` et modifier `VITE_API_URL`.

## Pages

| Route | Page | Accès |
|---|---|---|
| `/login` | Connexion | public |
| `/register` | Inscription (puis connexion automatique) | public |
| `/` | Films à l'affiche, recherche, filtre par genre | connecté |
| `/films/:id` | Détail d'un film, séances, réservation | connecté |
| `/reservations` | Mes réservations, annulation | connecté |
| `/admin` | CRUD films / salles / séances + toutes les réservations | admin |

## Structure

```
src/
├── api.js              # fetch + JWT (localStorage)
├── format.js           # dates, prix, durées
├── context/            # AuthContext (utilisateur), ToastContext (messages)
├── components/         # Navbar, Modal, Poster, ProtectedRoute, Loading
└── pages/              # Login, Register, Films, FilmDetail, Reservations, Admin
```

Le token JWT est envoyé dans `Authorization: Bearer <token>`. Si l'API le refuse
(401 ou « Token incorrect »), l'utilisateur est déconnecté et renvoyé vers `/login`.
