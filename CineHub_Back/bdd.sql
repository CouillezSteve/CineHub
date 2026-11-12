DROP DATABASE IF EXISTS cinehub;

CREATE DATABASE cinehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cine_user'@'localhost' IDENTIFIED BY 'CinehubDev';
GRANT SELECT, INSERT, UPDATE, DELETE ON cinehub.* TO 'cine_user'@'localhost';
FLUSH PRIVILEGES;

USE cinehub;

CREATE TABLE users (
  us_id INT AUTO_INCREMENT PRIMARY KEY,
  us_username VARCHAR(255) NOT NULL UNIQUE,
  us_password TEXT NOT NULL,
  us_email VARCHAR(255) NOT NULL UNIQUE,
  us_role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE films (
  fi_id INT AUTO_INCREMENT PRIMARY KEY,
  fi_title VARCHAR(255) NOT NULL,
  fi_description TEXT,
  fi_duration INT NOT NULL,
  fi_genre VARCHAR(100),
  fi_release_date DATE,
  fi_is_showing TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE rooms (
  ro_id INT AUTO_INCREMENT PRIMARY KEY,
  ro_name VARCHAR(100) NOT NULL UNIQUE,
  ro_capacity INT NOT NULL
);

CREATE TABLE screenings (
  sc_id INT AUTO_INCREMENT PRIMARY KEY,
  sc_film INT NOT NULL,
  sc_room INT NOT NULL,
  sc_datetime DATETIME NOT NULL,
  sc_price DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (sc_film) REFERENCES films(fi_id) ON DELETE CASCADE,
  FOREIGN KEY (sc_room) REFERENCES rooms(ro_id) ON DELETE CASCADE
);

CREATE TABLE reservations (
  re_id INT AUTO_INCREMENT PRIMARY KEY,
  re_user INT NOT NULL,
  re_screening INT NOT NULL,
  re_seats INT NOT NULL DEFAULT 1,
  re_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (re_user) REFERENCES users(us_id) ON DELETE CASCADE,
  FOREIGN KEY (re_screening) REFERENCES screenings(sc_id) ON DELETE CASCADE,
  UNIQUE (re_user, re_screening)
);

-- Compte admin de démonstration (mot de passe : Admin1234)
INSERT INTO users (us_username, us_password, us_email, us_role)
VALUES ('admin', 'COLLE_TON_HASH_ICI', 'admin@cinehub.com', 'admin');

INSERT INTO films (fi_title, fi_description, fi_duration, fi_genre, fi_release_date, fi_is_showing) VALUES
('Inception', 'Un voleur s''infiltre dans les rêves pour y implanter une idée.', 148, 'Science-fiction', '2010-07-21', 1),
('Le Parrain', 'La saga d''une famille mafieuse new-yorkaise.', 175, 'Drame', '1972-10-18', 1),
('Interstellar', 'Des explorateurs traversent un trou de ver pour sauver l''humanité.', 169, 'Science-fiction', '2014-11-05', 1),
('Amélie Poulain', 'Une jeune serveuse parisienne décide d''embellir la vie des autres.', 122, 'Comédie', '2001-04-25', 0);

INSERT INTO rooms (ro_name, ro_capacity) VALUES
('Salle 1', 120),
('Salle 2', 80),
('Salle 3', 50);

INSERT INTO screenings (sc_film, sc_room, sc_datetime, sc_price) VALUES
(1, 1, '2026-12-01 20:00:00', 9.50),
(1, 2, '2026-12-02 18:00:00', 8.50),
(2, 1, '2026-12-03 21:00:00', 9.50),
(3, 3, '2026-12-04 19:30:00', 10.00);