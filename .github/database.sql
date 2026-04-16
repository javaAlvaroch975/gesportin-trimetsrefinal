-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: database:3306
-- Generation Time: Apr 06, 2026 at 06:52 AM
-- Server version: 8.1.0
-- PHP Version: 8.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `gesportin`
--

-- --------------------------------------------------------

--
-- Table structure for table `articulo`
--

CREATE TABLE `articulo` (
  `id` bigint NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `precio` decimal(38,2) NOT NULL,
  `descuento` decimal(38,2) DEFAULT NULL,
  `imagen` longblob,
  `id_tipoarticulo` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carrito`
--

CREATE TABLE `carrito` (
  `id` bigint NOT NULL,
  `cantidad` int NOT NULL,
  `id_articulo` bigint NOT NULL,
  `id_usuario` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categoria`
--

CREATE TABLE `categoria` (
  `id` bigint NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `id_temporada` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `club`
--

CREATE TABLE `club` (
  `id` bigint NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `dirección` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `teléfono` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `fecha_alta` datetime NOT NULL,
  `imagen` longblob
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comentario`
--

CREATE TABLE `comentario` (
  `id` bigint NOT NULL,
  `contenido` varchar(1024) COLLATE utf32_unicode_ci NOT NULL,
  `id_noticia` bigint NOT NULL,
  `id_usuario` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comentarioart`
--

CREATE TABLE `comentarioart` (
  `id` bigint NOT NULL,
  `contenido` varchar(1024) COLLATE utf32_unicode_ci NOT NULL,
  `id_articulo` bigint NOT NULL,
  `id_usuario` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `compra`
--

CREATE TABLE `compra` (
  `id` bigint NOT NULL,
  `cantidad` int NOT NULL,
  `precio` double NOT NULL,
  `id_articulo` bigint NOT NULL,
  `id_factura` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cuota`
--

CREATE TABLE `cuota` (
  `id` bigint NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `cantidad` decimal(38,2) NOT NULL,
  `fecha` datetime NOT NULL,
  `id_equipo` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipo`
--

CREATE TABLE `equipo` (
  `id` bigint NOT NULL,
  `nombre` varchar(1024) COLLATE utf32_unicode_ci NOT NULL,
  `id_entrenador` bigint NOT NULL,
  `id_categoria` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estadopartido`
--

CREATE TABLE `estadopartido` (
  `id` bigint NOT NULL,
  `descripcion` varchar(255) COLLATE utf32_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

--
-- Dumping data for table `estadopartido`
--

INSERT INTO `estadopartido` (`id`, `descripcion`) VALUES
(1, 'No jugado'),
(2, 'Aplazado'),
(3, 'Ganado'),
(4, 'Perdido'),
(5, 'Empatado');

-- --------------------------------------------------------

--
-- Table structure for table `factura`
--

CREATE TABLE `factura` (
  `id` bigint NOT NULL,
  `fecha` datetime NOT NULL,
  `id_usuario` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jugador`
--

CREATE TABLE `jugador` (
  `id` bigint NOT NULL,
  `dorsal` int NOT NULL,
  `posicion` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `capitan` tinyint(1) NOT NULL DEFAULT '0',
  `imagen` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  `id_equipo` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `liga`
--

CREATE TABLE `liga` (
  `id` bigint NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `id_equipo` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `noticia`
--

CREATE TABLE `noticia` (
  `id` bigint NOT NULL,
  `titulo` varchar(1024) COLLATE utf32_unicode_ci NOT NULL,
  `contenido` text CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `imagen` longblob,
  `id_club` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pago`
--

CREATE TABLE `pago` (
  `id` bigint NOT NULL,
  `id_cuota` bigint NOT NULL,
  `id_jugador` bigint NOT NULL,
  `abonado` bit(1) NOT NULL,
  `fecha` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partido`
--

CREATE TABLE `partido` (
  `id` bigint NOT NULL,
  `rival` varchar(1024) COLLATE utf32_unicode_ci NOT NULL,
  `id_liga` bigint NOT NULL,
  `local` tinyint(1) NOT NULL,
  `resultado` varchar(1024) COLLATE utf32_unicode_ci NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `lugar` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `id_estadopartido` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `puntuacion`
--

CREATE TABLE `puntuacion` (
  `id` bigint NOT NULL,
  `puntuacion` int NOT NULL,
  `id_noticia` bigint NOT NULL,
  `id_usuario` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `puntuacionart`
--

CREATE TABLE `puntuacionart` (
  `id` bigint NOT NULL,
  `puntuacion` int NOT NULL,
  `id_articulo` bigint NOT NULL,
  `id_usuario` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `rolusuario`
--

CREATE TABLE `rolusuario` (
  `id` bigint NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `temporada`
--

CREATE TABLE `temporada` (
  `id` bigint NOT NULL,
  `descripcion` varchar(256) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `id_club` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tipoarticulo`
--

CREATE TABLE `tipoarticulo` (
  `id` bigint NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `id_club` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tipousuario`
--

CREATE TABLE `tipousuario` (
  `id` bigint NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

--
-- Dumping data for table `tipousuario`
--

INSERT INTO `tipousuario` (`id`, `descripcion`) VALUES
(1, 'Administrador'),
(2, 'Administrador de club'),
(3, 'Usuario');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint NOT NULL,
  `nombre` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `apellido1` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `apellido2` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf32_unicode_ci NOT NULL,
  `fecha_alta` datetime NOT NULL,
  `genero` int NOT NULL,
  `id_tipousuario` bigint NOT NULL,
  `id_club` bigint NOT NULL,
  `id_rolusuario` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido1`, `apellido2`, `username`, `password`, `fecha_alta`, `genero`, `id_tipousuario`, `id_club`, `id_rolusuario`) VALUES
(1, 'Jose', 'Gutiérrez', 'Cruz', 'admin', '7e4b4f5529e084ecafb996c891cfbd5b5284f5b00dc155c37bbb62a9f161a72e', '2026-03-30 15:57:44', 0, 1, 1, 1),
(2, 'Maria', 'García', 'López', 'clubadmin', '7e4b4f5529e084ecafb996c891cfbd5b5284f5b00dc155c37bbb62a9f161a72e', '2026-03-30 15:57:44', 1, 2, 1, 1),
(3, 'Carla', 'Sánchez', 'Martínez', 'usuario', '7e4b4f5529e084ecafb996c891cfbd5b5284f5b00dc155c37bbb62a9f161a72e', '2026-03-30 15:57:44', 1, 3, 1, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articulo`
--
ALTER TABLE `articulo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKsonjnqwy0gt39ls91v17nfwxr` (`id_tipoarticulo`);

--
-- Indexes for table `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKcvhp849os0y4eck4jlwa8261f` (`id_articulo`),
  ADD KEY `FKsbqpxk63xrpyck17xawl195dt` (`id_usuario`);

--
-- Indexes for table `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK5wso2m2cs9a5auxbyeug1svb4` (`id_temporada`);

--
-- Indexes for table `club`
--
ALTER TABLE `club`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKnfm3aid676kgfv2eghlcspkhy` (`id_noticia`),
  ADD KEY `FK9619kv3mim3a4yl0m5mdhhbh1` (`id_usuario`);

--
-- Indexes for table `comentarioart`
--
ALTER TABLE `comentarioart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2txo6h8k70f1hnrhfndyks0k6` (`id_articulo`),
  ADD KEY `FKhjvsujewps75ag506ll0nhxbr` (`id_usuario`);

--
-- Indexes for table `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK45tujme9940nngjl3ymboryi3` (`id_articulo`),
  ADD KEY `FKl23p4v9d3lg9vjthecu8i7ixv` (`id_factura`);

--
-- Indexes for table `cuota`
--
ALTER TABLE `cuota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKor7b2a0afrseeu7mk6ctjcj13` (`id_equipo`);

--
-- Indexes for table `equipo`
--
ALTER TABLE `equipo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK6ctox2d99lgj2v105weg7ed5e` (`id_categoria`),
  ADD KEY `FKp0b0mujjs0hljr6sbtopjgvyw` (`id_entrenador`);

--
-- Indexes for table `estadopartido`
--
ALTER TABLE `estadopartido`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK20l7cekp55mhbab3q09tx9ato` (`id_usuario`);

--
-- Indexes for table `jugador`
--
ALTER TABLE `jugador`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKi60lqb7emposedyui33q42u1i` (`id_equipo`),
  ADD KEY `FK4l9civft8pub4je5v0009m858` (`id_usuario`);

--
-- Indexes for table `liga`
--
ALTER TABLE `liga`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKc93itu3ascstblg0d1taxr2s8` (`id_equipo`);

--
-- Indexes for table `noticia`
--
ALTER TABLE `noticia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKm1t6gdjqk9qbxtymfsrl5w38y` (`id_club`);

--
-- Indexes for table `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKonch4hy8el3uyqxm2497mdal4` (`id_cuota`),
  ADD KEY `FKlj1d0yxpgf7kh9ykelhqrqs53` (`id_jugador`);

--
-- Indexes for table `partido`
--
ALTER TABLE `partido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK7vih20gd7qjugbdwwhujxvi7o` (`id_liga`);

--
-- Indexes for table `puntuacion`
--
ALTER TABLE `puntuacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKtfmyqw629wh8d3i066yq3qrxl` (`id_noticia`),
  ADD KEY `FKq7vc8i3j171whn8lpswgcgyrj` (`id_usuario`);

--
-- Indexes for table `puntuacionart`
--
ALTER TABLE `puntuacionart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2oufenj1rtondmqu13a0lx619` (`id_articulo`),
  ADD KEY `FKpm5b083nr6w0nx6avj6xv4xb` (`id_usuario`);

--
-- Indexes for table `rolusuario`
--
ALTER TABLE `rolusuario`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `temporada`
--
ALTER TABLE `temporada`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK4t1e3bqht94swpkrjpqrifpcj` (`id_club`);

--
-- Indexes for table `tipoarticulo`
--
ALTER TABLE `tipoarticulo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKijded6ap2rqhu65qtlsypkkt8` (`id_club`);

--
-- Indexes for table `tipousuario`
--
ALTER TABLE `tipousuario`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKfwlv0l9is3cqh8svkypwbswlg` (`id_club`),
  ADD KEY `FKbv8uo5bh4gauhgjh4vycu2a5e` (`id_rolusuario`),
  ADD KEY `FK142plrytoogsme2hd0d9xm7c0` (`id_tipousuario`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articulo`
--
ALTER TABLE `articulo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `club`
--
ALTER TABLE `club`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comentario`
--
ALTER TABLE `comentario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comentarioart`
--
ALTER TABLE `comentarioart`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `compra`
--
ALTER TABLE `compra`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cuota`
--
ALTER TABLE `cuota`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estadopartido`
--
ALTER TABLE `estadopartido`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `factura`
--
ALTER TABLE `factura`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jugador`
--
ALTER TABLE `jugador`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `liga`
--
ALTER TABLE `liga`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `noticia`
--
ALTER TABLE `noticia`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pago`
--
ALTER TABLE `pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partido`
--
ALTER TABLE `partido`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `puntuacion`
--
ALTER TABLE `puntuacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `puntuacionart`
--
ALTER TABLE `puntuacionart`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rolusuario`
--
ALTER TABLE `rolusuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `temporada`
--
ALTER TABLE `temporada`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tipoarticulo`
--
ALTER TABLE `tipoarticulo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tipousuario`
--
ALTER TABLE `tipousuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=205;

COMMIT;
