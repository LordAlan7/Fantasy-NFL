-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-09-2026 a las 05:06:26
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
-- Estructura de tabla para la tabla `mi_coleccion`
--

CREATE TABLE `mi_coleccion` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `cantidad` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mi_coleccion`
--

INSERT INTO `mi_coleccion` (`id`, `user_id`, `player_id`, `created_at`, `cantidad`) VALUES
(6, 2, 31, '2026-09-22 23:09:20', 1);

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
  `position` varchar(5) NOT NULL DEFAULT 'QB',
  `puntos_semana` decimal(5,1) DEFAULT NULL,
  `rareza` varchar(12) NOT NULL DEFAULT 'Común',
  `estado` varchar(10) NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `players`
--

INSERT INTO `players` (`id`, `player_name`, `team`, `conference`, `division`, `position`, `puntos_semana`, `rareza`, `estado`) VALUES
(1, 'Josh Allen', 'Buffalo Bills', 'AFC', 'East', 'QB', 24.5, 'Legendaria', 'activo'),
(2, 'Drake Maye', 'New England Patriots', 'AFC', 'East', 'QB', 9.8, 'Rara', 'activo'),
(3, 'Geno Smith', 'New York Jets', 'AFC', 'East', 'QB', 16.0, 'Rara', 'activo'),
(4, 'Malik Willis', 'Miami Dolphins', 'AFC', 'East', 'QB', 8.0, 'Común', 'activo'),
(5, 'Lamar Jackson', 'Baltimore Ravens', 'AFC', 'North', 'QB', 22.1, 'Legendaria', 'activo'),
(6, 'Joe Burrow', 'Cincinnati Bengals', 'AFC', 'North', 'QB', 18.6, 'Legendaria', 'activo'),
(7, 'Deshaun Watson', 'Cleveland Browns', 'AFC', 'North', 'QB', 12.0, 'Rara', 'activo'),
(8, 'Aaron Rodgers', 'Pittsburgh Steelers', 'AFC', 'North', 'QB', 14.5, 'Épica', 'activo'),
(9, 'C.J. Stroud', 'Houston Texans', 'AFC', 'South', 'QB', 17.9, 'Épica', 'activo'),
(10, 'Daniel Jones', 'Indianapolis Colts', 'AFC', 'South', 'QB', 13.0, 'Común', 'activo'),
(11, 'Trevor Lawrence', 'Jacksonville Jaguars', 'AFC', 'South', 'QB', 15.0, 'Rara', 'activo'),
(12, 'Cam Ward', 'Tennessee Titans', 'AFC', 'South', 'QB', 11.0, 'Común', 'activo'),
(13, 'Bo Nix', 'Denver Broncos', 'AFC', 'West', 'QB', 16.0, 'Rara', 'activo'),
(14, 'Patrick Mahomes', 'Kansas City Chiefs', 'AFC', 'West', 'QB', 19.8, 'Legendaria', 'activo'),
(15, 'Kirk Cousins', 'Las Vegas Raiders', 'AFC', 'West', 'QB', 12.5, 'Rara', 'activo'),
(16, 'Justin Herbert', 'Los Angeles Chargers', 'AFC', 'West', 'QB', 16.5, 'Épica', 'activo'),
(17, 'Dak Prescott', 'Dallas Cowboys', 'NFC', 'East', 'QB', 18.4, 'Épica', 'activo'),
(18, 'Jaxson Dart', 'New York Giants', 'NFC', 'East', 'QB', 9.0, 'Común', 'activo'),
(19, 'Jalen Hurts', 'Philadelphia Eagles', 'NFC', 'East', 'QB', 21.3, 'Legendaria', 'activo'),
(20, 'Jayden Daniels', 'Washington Commanders', 'NFC', 'East', 'QB', 20.6, 'Épica', 'activo'),
(21, 'Caleb Williams', 'Chicago Bears', 'NFC', 'North', 'QB', 14.0, 'Rara', 'activo'),
(22, 'Jared Goff', 'Detroit Lions', 'NFC', 'North', 'QB', 17.0, 'Rara', 'activo'),
(23, 'Jordan Love', 'Green Bay Packers', 'NFC', 'North', 'QB', 15.5, 'Rara', 'activo'),
(24, 'Kyler Murray', 'Minnesota Vikings', 'NFC', 'North', 'QB', 16.8, 'Rara', 'activo'),
(25, 'Tua Tagovailoa', 'Atlanta Falcons', 'NFC', 'South', 'QB', 13.5, 'Rara', 'activo'),
(26, 'Bryce Young', 'Carolina Panthers', 'NFC', 'South', 'QB', 10.0, 'Común', 'activo'),
(27, 'Tyler Shough', 'New Orleans Saints', 'NFC', 'South', 'QB', 8.5, 'Común', 'activo'),
(28, 'Baker Mayfield', 'Tampa Bay Buccaneers', 'NFC', 'South', 'QB', 15.8, 'Rara', 'activo'),
(29, 'Jacoby Brissett', 'Arizona Cardinals', 'NFC', 'West', 'QB', 9.5, 'Común', 'activo'),
(30, 'Matthew Stafford', 'Los Angeles Rams', 'NFC', 'West', 'QB', 11.0, 'Épica', 'activo'),
(31, 'Brock Purdy', 'San Francisco 49ers', 'NFC', 'West', 'QB', 20.9, 'Épica', 'activo'),
(32, 'Sam Darnold', 'Seattle Seahawks', 'NFC', 'West', 'QB', 6.0, 'Rara', 'activo'),
(33, 'Bijan Robinson', 'Atlanta Falcons', 'NFC', 'South', 'RB', 23.4, 'Legendaria', 'activo'),
(34, 'Jahmyr Gibbs', 'Detroit Lions', 'NFC', 'North', 'RB', 21.7, 'Épica', 'activo'),
(35, 'Christian McCaffrey', 'San Francisco 49ers', 'NFC', 'West', 'RB', 19.5, 'Legendaria', 'activo'),
(36, 'Saquon Barkley', 'Philadelphia Eagles', 'NFC', 'East', 'RB', 22.8, 'Legendaria', 'activo'),
(37, 'Derrick Henry', 'Baltimore Ravens', 'AFC', 'North', 'RB', 20.2, 'Épica', 'activo'),
(38, 'Jonathan Taylor', 'Indianapolis Colts', 'AFC', 'South', 'RB', 18.9, 'Épica', 'activo'),
(39, 'Ashton Jeanty', 'Las Vegas Raiders', 'AFC', 'West', 'RB', 15.6, 'Rara', 'activo'),
(40, 'Kyren Williams', 'Los Angeles Rams', 'NFC', 'West', 'RB', 17.3, 'Rara', 'activo'),
(41, 'De\'Von Achane', 'Miami Dolphins', 'AFC', 'East', 'RB', 19.1, 'Épica', 'activo'),
(42, 'James Cook', 'Buffalo Bills', 'AFC', 'East', 'RB', 16.9, 'Rara', 'activo'),
(43, 'Breece Hall', 'New York Jets', 'AFC', 'East', 'RB', 15.4, 'Rara', 'activo'),
(44, 'Chase Brown', 'Cincinnati Bengals', 'AFC', 'North', 'RB', 14.8, 'Común', 'activo'),
(45, 'Ja\'Marr Chase', 'Cincinnati Bengals', 'AFC', 'North', 'WR', 24.1, 'Legendaria', 'activo'),
(46, 'CeeDee Lamb', 'Dallas Cowboys', 'NFC', 'East', 'WR', 20.4, 'Legendaria', 'activo'),
(47, 'Justin Jefferson', 'Minnesota Vikings', 'NFC', 'North', 'WR', 19.7, 'Legendaria', 'activo'),
(48, 'Amon-Ra St. Brown', 'Detroit Lions', 'NFC', 'North', 'WR', 18.3, 'Épica', 'activo'),
(49, 'Puka Nacua', 'Los Angeles Rams', 'NFC', 'West', 'WR', 21.5, 'Épica', 'activo'),
(50, 'Malik Nabers', 'New York Giants', 'NFC', 'East', 'WR', 16.8, 'Rara', 'activo'),
(51, 'Nico Collins', 'Houston Texans', 'AFC', 'South', 'WR', 17.2, 'Rara', 'activo'),
(52, 'Drake London', 'Atlanta Falcons', 'NFC', 'South', 'WR', 15.9, 'Rara', 'activo'),
(53, 'Tyreek Hill', 'Miami Dolphins', 'AFC', 'East', 'WR', 18.0, 'Épica', 'activo'),
(54, 'A.J. Brown', 'Philadelphia Eagles', 'NFC', 'East', 'WR', 17.6, 'Épica', 'activo'),
(55, 'Davante Adams', 'Los Angeles Rams', 'NFC', 'West', 'WR', 16.2, 'Épica', 'activo'),
(56, 'DK Metcalf', 'Pittsburgh Steelers', 'AFC', 'North', 'WR', 15.1, 'Rara', 'activo'),
(57, 'Brock Bowers', 'Las Vegas Raiders', 'AFC', 'West', 'TE', 16.4, 'Épica', 'activo'),
(58, 'Trey McBride', 'Arizona Cardinals', 'NFC', 'West', 'TE', 14.7, 'Rara', 'activo'),
(59, 'Sam LaPorta', 'Detroit Lions', 'NFC', 'North', 'TE', 12.3, 'Rara', 'activo'),
(60, 'Mark Andrews', 'Baltimore Ravens', 'AFC', 'North', 'TE', 11.8, 'Rara', 'activo'),
(61, 'George Kittle', 'San Francisco 49ers', 'NFC', 'West', 'TE', 15.0, 'Épica', 'activo'),
(62, 'Evan Engram', 'Denver Broncos', 'AFC', 'West', 'TE', 11.2, 'Común', 'activo'),
(63, 'David Njoku', 'Cleveland Browns', 'AFC', 'North', 'TE', 10.6, 'Común', 'activo'),
(64, 'Brandon Aubrey', 'Dallas Cowboys', 'NFC', 'East', 'K', 9.0, 'Rara', 'activo'),
(65, 'Harrison Butker', 'Kansas City Chiefs', 'AFC', 'West', 'K', 8.0, 'Común', 'activo'),
(66, 'Chris Boswell', 'Pittsburgh Steelers', 'AFC', 'North', 'K', 7.0, 'Común', 'activo'),
(67, 'Jake Bates', 'Detroit Lions', 'NFC', 'North', 'K', 8.5, 'Común', 'activo'),
(68, 'Cameron Dicker', 'Los Angeles Chargers', 'AFC', 'West', 'K', 7.5, 'Común', 'activo'),
(69, '49ers D/ST', 'San Francisco 49ers', 'NFC', 'West', 'DEF', 10.0, 'Rara', 'activo'),
(70, 'Ravens D/ST', 'Baltimore Ravens', 'AFC', 'North', 'DEF', 9.0, 'Rara', 'activo'),
(71, 'Broncos D/ST', 'Denver Broncos', 'AFC', 'West', 'DEF', 8.0, 'Común', 'activo'),
(72, 'Steelers D/ST', 'Pittsburgh Steelers', 'AFC', 'North', 'DEF', 7.0, 'Común', 'activo'),
(73, 'Tom Brady', 'Tampa Bay Buccaneers', 'NFC', 'South', 'QB', NULL, 'Legendaria', 'retirado'),
(74, 'Peyton Manning', 'Denver Broncos', 'AFC', 'West', 'QB', NULL, 'Legendaria', 'retirado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sobres_abiertos`
--

CREATE TABLE `sobres_abiertos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indices de la tabla `mi_coleccion`
--
ALTER TABLE `mi_coleccion`
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
-- Indices de la tabla `sobres_abiertos`
--
ALTER TABLE `sobres_abiertos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT de la tabla `mi_coleccion`
--
ALTER TABLE `mi_coleccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `passing_stats`
--
ALTER TABLE `passing_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de la tabla `sobres_abiertos`
--
ALTER TABLE `sobres_abiertos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `mi_coleccion`
--
ALTER TABLE `mi_coleccion`
  ADD CONSTRAINT `fk_mi_equipo_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mi_equipo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `passing_stats`
--
ALTER TABLE `passing_stats`
  ADD CONSTRAINT `fk_passing_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sobres_abiertos`
--
ALTER TABLE `sobres_abiertos`
  ADD CONSTRAINT `sobres_abiertos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
