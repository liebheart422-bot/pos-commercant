-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 15 oct. 2026 à 12:17
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pos_cçommerces`
--

-- --------------------------------------------------------

--
-- Structure de la table `commercants`
--

CREATE TABLE `commercants` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `contact` varchar(101) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commercants`
--

INSERT INTO `commercants` (`id`, `nom`, `contact`, `date_creation`) VALUES
(1, 'boutique awa', '0745785263', '2026-10-15 09:59:32'),
(2, 'boutique awa', '0745785263', '2026-10-15 09:59:32'),
(3, 'boutique awa', '0745785263', '2026-10-15 10:01:01'),
(4, 'boutique awa', '0745785263', '2026-10-15 10:01:01'),
(5, 'boutique awa', '0745785263', '2026-10-15 10:01:58'),
(6, 'boutique awa', '0745785263', '2026-10-15 10:01:58'),
(7, 'boutique awa', '0745785263', '2026-10-15 10:03:14'),
(8, 'boutique awa', '0745785263', '2026-10-15 10:03:14');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id` int(11) NOT NULL,
  `commercant_id` int(11) NOT NULL,
  `prix` int(11) NOT NULL,
  `nom_prod` varchar(150) NOT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `prix_achat` decimal(10,2) NOT NULL DEFAULT 0.00,
  `prix_vente` decimal(10,2) NOT NULL,
  `quantite_stock` int(11) NOT NULL DEFAULT 0,
  `seuil_alerte` int(11) NOT NULL DEFAULT 0,
  `actif` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `commercant_id`, `prix`, `nom_prod`, `categorie`, `prix_achat`, `prix_vente`, `quantite_stock`, `seuil_alerte`, `actif`) VALUES
(1, 1, 0, 'savon', 'hygenes', 200.00, 300.00, 20, 8, 1),
(2, 2, 0, 'tomates', 'alimentation', 200.00, 300.00, 20, 8, 1),
(3, 2, 0, 'huile', 'alimentation', 200.00, 300.00, 20, 8, 1),
(4, 1, 0, 'riz', 'alimentation', 200.00, 300.00, 20, 8, 1);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `commercant_id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe_hash` varchar(255) NOT NULL,
  `role` varchar(56) NOT NULL DEFAULT 'proprietaire',
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `commercants`
--
ALTER TABLE `commercants`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_produits_commercant` (`commercant_id`),
  ADD KEY `idx_produits_nom` (`nom_prod`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `commercant_id` (`commercant_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `commercants`
--
ALTER TABLE `commercants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `produits_ibfk_1` FOREIGN KEY (`commercant_id`) REFERENCES `commercants` (`id`);

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`commercant_id`) REFERENCES `commercants` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

--
-- Structure de la table `mouvements_stock`
--

CREATE TABLE `mouvements_stock` (
  `id` int(11) NOT NULL,
  `commercant_id` int(11) NOT NULL,
  `produit_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantite` int(11) NOT NULL,
  `motif` varchar(150) DEFAULT NULL,
  `date_mouvement` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commercant_id` (`commercant_id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `mouvements_stock_ibfk_1` FOREIGN KEY (`commercant_id`) REFERENCES `commercants` (`id`),
  ADD CONSTRAINT `mouvements_stock_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`);
COMMIT;