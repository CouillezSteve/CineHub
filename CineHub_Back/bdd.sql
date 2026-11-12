CREATE DATABASE IF NOT EXISTS cinehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cinehub_user'@'localhost' IDENTIFIED BY 'CinehubDev';

GRANT SELECT, INSERT, UPDATE, DELETE ON cinehub.* TO 'cinehub_user'@'localhost';

FLUSH PRIVILEGES;

USE cinehub;



CREATE TABLE IF NOT EXISTS users (
  us_id INT AUTO_INCREMENT PRIMARY KEY,
  us_username VARCHAR(255) NOT NULL UNIQUE,
  us_password TEXT NOT NULL,
  us_email VARCHAR(255) NOT NULL UNIQUE,
  us_role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS films (
  fi_id INT AUTO_INCREMENT PRIMARY KEY,
  fi_title VARCHAR(255) NOT NULL,
  fi_description TEXT,
  fi_duration INT NOT NULL,
  fi_genre VARCHAR(100),
  fi_release_date DATE,
  fi_is_showing TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rooms (
  ro_id INT AUTO_INCREMENT PRIMARY KEY,
  ro_name VARCHAR(100) NOT NULL UNIQUE,
  ro_capacity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS screenings (
  sc_id INT AUTO_INCREMENT PRIMARY KEY,
  sc_film INT NOT NULL,
  sc_room INT NOT NULL,
  sc_datetime DATETIME NOT NULL,
  sc_price DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (sc_film) REFERENCES films(fi_id),
  FOREIGN KEY (sc_room) REFERENCES rooms(ro_id)
);

CREATE TABLE IF NOT EXISTS reservations (
  re_id INT AUTO_INCREMENT PRIMARY KEY,
  re_user INT NOT NULL,
  re_screening INT NOT NULL,
  re_seats INT NOT NULL DEFAULT 1,
  re_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (re_user) REFERENCES users(us_id),
  FOREIGN KEY (re_screening) REFERENCES screenings(sc_id),
  UNIQUE (re_user, re_screening)
);