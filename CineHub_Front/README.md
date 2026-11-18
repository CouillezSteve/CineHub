# CineHub — Front

Interface web de CineHub (HTML, JavaScript, Bootstrap 5). Elle consomme l'API du dossier `CineHub_Back`.

## Lancer

1. Démarrer l'API : dans `CineHub_Back`, `npm start` (elle écoute sur `http://127.0.0.1:3000`).
2. Ouvrir le front, au choix :
   - avec l'extension VS Code **Live Server** : clic droit sur `index.html`, puis *Open with Live Server* ;
   - ou en ligne de commande, dans `CineHub_Front` : `npx serve .` ;
   - ou en double-cliquant sur `login.html`.

Si l'API tourne sur une autre adresse, modifier `API_URL` en haut de `js/api.js`.

## Pages

| Page | Rôle |
|---|---|
| `login.html` / `register.html` | Connexion et inscription |
| `index.html` | Films à l'affiche (recherche + filtre par genre) |
| `film.html?id=…` | Détail d'un film, séances à venir, réservation |
| `reservations.html` | Mes réservations et annulation |
| `admin.html` | Administration : films, salles, séances, réservations (rôle `admin`) |

## Fonctionnement

- Le token JWT est stocké dans le `localStorage` du navigateur (clé `cinehub_token`) et envoyé dans l'en-tête `Authorization: Bearer …`.
- Sans token valide, les pages protégées renvoient vers `login.html`. La page admin renvoie vers `index.html` si l'utilisateur n'est pas admin.
- Compte admin de démonstration : voir le `README.md` à la racine du projet.
