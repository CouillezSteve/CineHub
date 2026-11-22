# CineHub

API REST de gestion d'un cinéma (films, salles, séances, réservations).
Stack : Node.js (ES modules), Express, MySQL (mysql2/promise), JWT + bcrypt, dotenv, nodemon.

## Installation

1. Cloner le dépôt puis `cd CineHub_Back`
2. `npm install`
3. Exécuter `bdd.sql` avec un compte root :
   `mysql -u root -p < bdd.sql`
4. Copier `.env.example` en `.env` et renseigner les valeurs
   (adapter `DB_PORT` et `DB_PASSWORD` : le mot de passe de `cine_user` est défini dans `bdd.sql`)

## Lancement

- Développement : `npm run dev`
- Production : `npm start`

L'API écoute sur `http://127.0.0.1:3000`.

## Front (bonus)

Une interface React + Vite + Bootstrap est fournie dans `CineHub_Front` (voir son `README.md`).

1. Lancer l'API : `npm run dev` dans `CineHub_Back` (port 3000)
2. Dans `CineHub_Front` : `npm install` puis `npm run dev`
3. Ouvrir http://localhost:5173

## Documentation

Supports de présentation dans le dossier `Docs/` :

- [Diapos de présentation](Docs/CineHub_Diapos.pdf)
- [Guide pour l'oral](Docs/CineHub_Guide_Oral.pdf)

## Comptes de test

| Rôle  | Username | Mot de passe |
|-------|----------|--------------|
| Admin | admin    | Admin1234    |

Un compte `user` se crée avec `POST /auth/register`.

## Exemples d'appels

Connexion :

    POST /auth/login
    { "username": "admin", "password": "Admin1234" }

Liste des films (avec token) :

    GET /films
    Authorization: Bearer <token>

Réserver une séance :

    POST /reservations
    { "screening": 3, "seats": 2 }

## Codes de réponse

200 succès, 201 création, 401 token absent, 403 token invalide / droits / champs manquants / plus de places, 404 introuvable, 500 erreur serveur.