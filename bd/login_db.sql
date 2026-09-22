-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-09-2026 a las 05:19:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `login_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mi_equipo`
--

CREATE TABLE `mi_equipo` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mi_equipo`
--

INSERT INTO `mi_equipo` (`id`, `user_id`, `player_id`, `created_at`) VALUES
(3, 2, 31, '2026-09-12 03:15:36'),
(4, 2, 32, '2026-09-12 03:15:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `passing_stats`
--

CREATE TABLE `passing_stats` (
  `id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `season` int(11) NOT NULL,
  `season_type` varchar(10) NOT NULL DEFAULT 'REG',
  `week` int(11) NOT NULL,
  `pass_yds` int(11) DEFAULT 0,
  `yds_per_att` decimal(5,1) DEFAULT 0.0,
  `att` int(11) DEFAULT 0,
  `cmp` int(11) DEFAULT 0,
  `cmp_pct` decimal(5,1) DEFAULT 0.0,
  `td` int(11) DEFAULT 0,
  `interceptions` int(11) DEFAULT 0,
  `passer_rating` decimal(5,1) DEFAULT 0.0,
  `first_downs` int(11) DEFAULT 0,
  `first_down_pct` decimal(5,1) DEFAULT 0.0,
  `plays_20plus` int(11) DEFAULT 0,
  `plays_40plus` int(11) DEFAULT 0,
  `long_pass` int(11) DEFAULT 0,
  `sacked` int(11) DEFAULT 0,
  `sacked_yds_lost` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `passing_stats`
--

INSERT INTO `passing_stats` (`id`, `player_id`, `season`, `season_type`, `week`, `pass_yds`, `yds_per_att`, `att`, `cmp`, `cmp_pct`, `td`, `interceptions`, `passer_rating`, `first_downs`, `first_down_pct`, `plays_20plus`, `plays_40plus`, `long_pass`, `sacked`, `sacked_yds_lost`) VALUES
(1, 31, 2026, 'REG', 1, 205, 6.0, 34, 25, 73.5, 3, 1, 105.6, 12, 35.3, 1, 0, 39, 0, 0),
(2, 2, 2026, 'REG', 1, 178, 5.4, 33, 23, 69.7, 1, 3, 54.9, 9, 27.3, 0, 0, 19, 3, 10),
(3, 30, 2026, 'REG', 1, 155, 6.2, 25, 15, 60.0, 0, 1, 61.2, 5, 20.0, 2, 1, 41, 0, 0),
(4, 32, 2026, 'REG', 1, 13, 6.5, 2, 1, 50.0, 0, 0, 70.8, 1, 50.0, 0, 0, 13, 1, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `team` varchar(50) NOT NULL,
  `conference` varchar(3) NOT NULL,
  `division` varchar(10) NOT NULL,
  `position` varchar(5) NOT NULL DEFAULT 'QB'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `players`
--

INSERT INTO `players` (`id`, `player_name`, `team`, `conference`, `division`, `position`) VALUES
(1, 'Josh Allen', 'Buffalo Bills', 'AFC', 'East', 'QB'),
(2, 'Drake Maye', 'New England Patriots', 'AFC', 'East', 'QB'),
(3, 'Geno Smith', 'New York Jets', 'AFC', 'East', 'QB'),
(4, 'Malik Willis', 'Miami Dolphins', 'AFC', 'East', 'QB'),
(5, 'Lamar Jackson', 'Baltimore Ravens', 'AFC', 'North', 'QB'),
(6, 'Joe Burrow', 'Cincinnati Bengals', 'AFC', 'North', 'QB'),
(7, 'Deshaun Watson', 'Cleveland Browns', 'AFC', 'North', 'QB'),
(8, 'Aaron Rodgers', 'Pittsburgh Steelers', 'AFC', 'North', 'QB'),
(9, 'C.J. Stroud', 'Houston Texans', 'AFC', 'South', 'QB'),
(10, 'Daniel Jones', 'Indianapolis Colts', 'AFC', 'South', 'QB'),
(11, 'Trevor Lawrence', 'Jacksonville Jaguars', 'AFC', 'South', 'QB'),
(12, 'Cam Ward', 'Tennessee Titans', 'AFC', 'South', 'QB'),
(13, 'Bo Nix', 'Denver Broncos', 'AFC', 'West', 'QB'),
(14, 'Patrick Mahomes', 'Kansas City Chiefs', 'AFC', 'West', 'QB'),
(15, 'Kirk Cousins', 'Las Vegas Raiders', 'AFC', 'West', 'QB'),
(16, 'Justin Herbert', 'Los Angeles Chargers', 'AFC', 'West', 'QB'),
(17, 'Dak Prescott', 'Dallas Cowboys', 'NFC', 'East', 'QB'),
(18, 'Jaxson Dart', 'New York Giants', 'NFC', 'East', 'QB'),
(19, 'Jalen Hurts', 'Philadelphia Eagles', 'NFC', 'East', 'QB'),
(20, 'Jayden Daniels', 'Washington Commanders', 'NFC', 'East', 'QB'),
(21, 'Caleb Williams', 'Chicago Bears', 'NFC', 'North', 'QB'),
(22, 'Jared Goff', 'Detroit Lions', 'NFC', 'North', 'QB'),
(23, 'Jordan Love', 'Green Bay Packers', 'NFC', 'North', 'QB'),
(24, 'Kyler Murray', 'Minnesota Vikings', 'NFC', 'North', 'QB'),
(25, 'Tua Tagovailoa', 'Atlanta Falcons', 'NFC', 'South', 'QB'),
(26, 'Bryce Young', 'Carolina Panthers', 'NFC', 'South', 'QB'),
(27, 'Tyler Shough', 'New Orleans Saints', 'NFC', 'South', 'QB'),
(28, 'Baker Mayfield', 'Tampa Bay Buccaneers', 'NFC', 'South', 'QB'),
(29, 'Jacoby Brissett', 'Arizona Cardinals', 'NFC', 'West', 'QB'),
(30, 'Matthew Stafford', 'Los Angeles Rams', 'NFC', 'West', 'QB'),
(31, 'Brock Purdy', 'San Francisco 49ers', 'NFC', 'West', 'QB'),
(32, 'Sam Darnold', 'Seattle Seahawks', 'NFC', 'West', 'QB');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`) VALUES
(2, 'admin@test.com', '$2y$10$fSCmLBcw22hu/Xbaej7GpuKMBHn55glvqsTCL10H.UBANrdlKFasy', '2026-09-08 19:17:26');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `mi_equipo`
--
ALTER TABLE `mi_equipo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_player` (`user_id`,`player_id`),
  ADD KEY `fk_mi_equipo_player` (`player_id`);

--
-- Indices de la tabla `passing_stats`
--
ALTER TABLE `passing_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_player_week` (`player_id`,`season`,`season_type`,`week`);

--
-- Indices de la tabla `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `mi_equipo`
--
ALTER TABLE `mi_equipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `passing_stats`
--
ALTER TABLE `passing_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `mi_equipo`
--
ALTER TABLE `mi_equipo`
  ADD CONSTRAINT `fk_mi_equipo_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mi_equipo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `passing_stats`
--
ALTER TABLE `passing_stats`
  ADD CONSTRAINT `fk_passing_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
