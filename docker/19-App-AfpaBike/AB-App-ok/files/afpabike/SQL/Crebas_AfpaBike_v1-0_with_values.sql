-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 02 oct. 2024 à 12:06
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `test_afpabike`
--

-- --------------------------------------------------------

--
-- Structure de la table `accessoire`
--

DROP TABLE IF EXISTS `accessoire`;
CREATE TABLE IF NOT EXISTS `accessoire` (
  `id_accessoire` int NOT NULL AUTO_INCREMENT,
  `nom_accessoire` varchar(100) DEFAULT NULL,
  `etat_accessoire` varchar(40) DEFAULT NULL,
  `dispo_accessoire` tinyint(1) DEFAULT NULL,
  `photo_accessoire` varchar(120) DEFAULT NULL,
  `couleur_accessoire` varchar(50) DEFAULT NULL,
  `numeroserie_accessoire` varchar(60) DEFAULT NULL,
  `prix_accessoire` float DEFAULT NULL,
  `taille_accessoire` varchar(10) DEFAULT NULL,
  `particularite_accessoire` varchar(50) DEFAULT NULL,
  `numeroafpa_accessoire` varchar(60) DEFAULT NULL,
  `actif_accessoire` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_accessoire`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `accessoire`
--

INSERT INTO `accessoire` (`id_accessoire`, `nom_accessoire`, `etat_accessoire`, `dispo_accessoire`, `photo_accessoire`, `couleur_accessoire`, `numeroserie_accessoire`, `prix_accessoire`, `taille_accessoire`, `particularite_accessoire`, `numeroafpa_accessoire`, `actif_accessoire`) VALUES
(1, 'Casque', 'ok', 0, '', 'Noir', '', 0, 'M', '', NULL, 1),
(2, 'Casque', 'à réviser', 0, '', 'Noir', '', 0, 'L', '', NULL, 1),
(3, 'Cadenas', '', 0, '', 'Noir', '', 0, '', 'Code', NULL, 1),
(4, 'Cadenas', '', 0, '', 'Noir', '', 0, '', '2 clefs', NULL, 1),
(5, 'Gilet', '', 0, '', 'Jaune', '', 0, 'M', '', NULL, 1),
(6, 'Gilet', '', 0, '', 'Jaune', '', 0, 'L', '', NULL, 1),
(7, 'Gilet', '', 0, '', 'Jaune', '', 0, 'S', '', NULL, 1),
(8, 'Porte bagage', '', 0, '', 'Noir', '', 0, '', '', NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `caution`
--

DROP TABLE IF EXISTS `caution`;
CREATE TABLE IF NOT EXISTS `caution` (
  `id_caution` int NOT NULL AUTO_INCREMENT,
  `libelle_caution` varchar(30) DEFAULT NULL,
  `montant_caution` float DEFAULT NULL,
  `actif_caution` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_caution`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `caution`
--

INSERT INTO `caution` (`id_caution`, `libelle_caution`, `montant_caution`, `actif_caution`) VALUES
(1, 'velo_caution', 80, 1);

-- --------------------------------------------------------

--
-- Structure de la table `contrat`
--

DROP TABLE IF EXISTS `contrat`;
CREATE TABLE IF NOT EXISTS `contrat` (
  `id_contrat` int NOT NULL AUTO_INCREMENT,
  `id_velo` int NOT NULL,
  `id_utilisateur` int NOT NULL,
  `id_type_identite` int DEFAULT NULL,
  `date_contrat` datetime DEFAULT NULL,
  `numero_contrat` varchar(30) DEFAULT NULL,
  `numeroidentite_contrat` varchar(30) DEFAULT NULL,
  `commentaire_contrat` varchar(150) DEFAULT NULL,
  `datedebut_loc_contrat` datetime DEFAULT NULL,
  `datefin_loc_contrat` datetime DEFAULT NULL,
  `retenue_caution` float DEFAULT NULL,
  `actif_contrat` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_contrat`),
  KEY `fk_contrat__type_identite` (`id_type_identite`),
  KEY `fk_contrat__utilisateur` (`id_utilisateur`),
  KEY `fk_contrat__velo` (`id_velo`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `contrat`
--

INSERT INTO `contrat` (`id_contrat`, `id_velo`, `id_utilisateur`, `id_type_identite`, `date_contrat`, `numero_contrat`, `numeroidentite_contrat`, `commentaire_contrat`, `datedebut_loc_contrat`, `datefin_loc_contrat`, `retenue_caution`, `actif_contrat`) VALUES
(1, 1, 3, 1, '2024-09-01 00:00:00', '2024_1', 'X4RTBPFW4', '', '2024-09-07 00:00:00', '2024-09-21 00:00:00', 0, 1),
(2, 2, 2, 2, '2024-09-08 00:00:00', '2024_2', '60RF00809', '', '2024-09-08 00:00:00', '2024-09-22 00:00:00', 0, 1);

-- --------------------------------------------------------

--
-- Structure de la table `contrat__accessoire`
--

DROP TABLE IF EXISTS `contrat__accessoire`;
CREATE TABLE IF NOT EXISTS `contrat__accessoire` (
  `id_contrat` int NOT NULL,
  `id_accessoire` int NOT NULL,
  PRIMARY KEY (`id_contrat`,`id_accessoire`),
  KEY `fk_contrat__accessoire2` (`id_accessoire`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `contrat__accessoire`
--

INSERT INTO `contrat__accessoire` (`id_contrat`, `id_accessoire`) VALUES
(1, 1),
(1, 4),
(1, 6),
(2, 1),
(2, 3),
(2, 7),
(2, 8);

-- --------------------------------------------------------

--
-- Structure de la table `famille_typerep`
--

DROP TABLE IF EXISTS `famille_typerep`;
CREATE TABLE IF NOT EXISTS `famille_typerep` (
  `id_famille_typerep` int NOT NULL AUTO_INCREMENT,
  `nom_famille_typerep` varchar(50) NOT NULL,
  `actif_famille_typerep` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_famille_typerep`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `famille_typerep`
--

INSERT INTO `famille_typerep` (`id_famille_typerep`, `nom_famille_typerep`, `actif_famille_typerep`) VALUES
(1, 'Forfait', 1),
(2, 'Roue', 1),
(3, 'Transmission', 1),
(4, 'Freinage', 1);

-- --------------------------------------------------------

--
-- Structure de la table `formation`
--

DROP TABLE IF EXISTS `formation`;
CREATE TABLE IF NOT EXISTS `formation` (
  `id_formation` int NOT NULL AUTO_INCREMENT,
  `nom_formation` varchar(100) NOT NULL,
  `actif_formation` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_formation`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `formation`
--

INSERT INTO `formation` (`id_formation`, `nom_formation`, `actif_formation`) VALUES
(1, 'DWWM', 1),
(2, 'Soudeur', 1),
(3, 'Mécanisien auto', 1),
(4, 'Mécanisien Bicycle', 1),
(5, 'CDA', 1),
(6, 'Secrétariat', 1);

-- --------------------------------------------------------

--
-- Structure de la table `marque`
--

DROP TABLE IF EXISTS `marque`;
CREATE TABLE IF NOT EXISTS `marque` (
  `id_marque` int NOT NULL AUTO_INCREMENT,
  `nom_marque` varchar(50) DEFAULT NULL,
  `actif_marque` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_marque`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `marque`
--

INSERT INTO `marque` (`id_marque`, `nom_marque`, `actif_marque`) VALUES
(1, 'Decathlon', 1),
(2, 'Montana', 1),
(3, 'GT', 1),
(4, 'Giant', 1),
(5, 'Massi', 1),
(6, 'Nakamura', 1),
(7, 'Btwin', 1);

-- --------------------------------------------------------

--
-- Structure de la table `modele`
--

DROP TABLE IF EXISTS `modele`;
CREATE TABLE IF NOT EXISTS `modele` (
  `id_modele` int NOT NULL AUTO_INCREMENT,
  `id_type_velo` int NOT NULL,
  `id_marque` int NOT NULL,
  `nom_modele` varchar(100) DEFAULT NULL,
  `actif_modele` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_modele`),
  KEY `fk_marque__modele` (`id_marque`),
  KEY `fk_modele__type_velo` (`id_type_velo`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `modele`
--

INSERT INTO `modele` (`id_modele`, `id_type_velo`, `id_marque`, `nom_modele`, `actif_modele`) VALUES
(1, 1, 1, 'Rockrider 5.2', 1),
(2, 2, 2, 'Mont', 1),
(3, 3, 1, 'Elops', 1),
(4, 1, 3, 'Talera', 1),
(5, 1, 1, 'Rockrider 4', 1),
(6, 1, 1, 'Rockrider 300', 1),
(7, 1, 1, 'Original 5', 1),
(8, 1, 1, 'Rockrider', 1),
(9, 1, 4, 'Escaper', 1),
(10, 4, 5, 'Master', 1),
(11, 2, 6, 'Women', 1),
(12, 1, 6, '470', 1),
(13, 2, 7, 'Flower', 1);

-- --------------------------------------------------------

--
-- Structure de la table `piece`
--

DROP TABLE IF EXISTS `piece`;
CREATE TABLE IF NOT EXISTS `piece` (
  `id_piece` int NOT NULL AUTO_INCREMENT,
  `nom_piece` varchar(150) DEFAULT NULL,
  `stock_piece` varchar(15) DEFAULT NULL,
  `actif_piece` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_piece`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `piece`
--

INSERT INTO `piece` (`id_piece`, `nom_piece`, `stock_piece`, `actif_piece`) VALUES
(1, 'Pneu', '0', 1),
(2, 'Fond de jante', '0', 1),
(3, 'Chambre à air', '0', 1),
(4, 'Rayon', '0', 1),
(5, 'Préventif 80ml', '0', 1),
(6, 'Valve', '0', 1),
(7, 'Pédale', '0', 1),
(8, 'Câble de dérailleur', '0', 1),
(9, 'Gaine de dérailleur', '0', 1),
(10, 'Boîtier de pédalier', '0', 1),
(11, 'Vis de pédalier', '0', 1),
(12, 'Roulement', '0', 1),
(13, 'Chaîne', '0', 1),
(14, 'Attache rapide', '0', 1),
(15, 'Plateau', '0', 1),
(16, 'Pédalier', '0', 1),
(17, 'Manivelle gauche', '0', 1),
(18, 'Roue libre 6V', '0', 1),
(19, 'Roue libre 7V', '0', 1),
(20, 'Roue libre 8V', '0', 1),
(21, 'Cassette', '0', 1),
(22, 'Poignée tournante', '0', 1),
(23, 'Manette push/pull', '0', 1),
(24, 'Levier de frein VTT', '0', 1),
(25, 'Câble de frein', '0', 1),
(26, 'Gaine de frein', '0', 1),
(27, 'Patins de frein route', '0', 1),
(28, 'Patin VTT', '0', 1),
(29, 'Etrier de frein Vbrake', '0', 1),
(30, 'Etrier cantilever', '0', 1),
(31, 'Etrier calipper', '0', 1),
(32, 'Etrier hydraulique', '0', 1),
(33, 'Levier de frein route', '0', 1),
(34, 'Plaquette de frein (paire)', '0', 1);

-- --------------------------------------------------------

--
-- Structure de la table `piece__typerep`
--

DROP TABLE IF EXISTS `piece__typerep`;
CREATE TABLE IF NOT EXISTS `piece__typerep` (
  `id_piece` int NOT NULL,
  `id_typerep` int NOT NULL,
  PRIMARY KEY (`id_piece`,`id_typerep`),
  KEY `fk_piece__typrerep2` (`id_typerep`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `piece__typerep`
--

INSERT INTO `piece__typerep` (`id_piece`, `id_typerep`) VALUES
(1, 4),
(2, 4),
(2, 5),
(2, 8),
(2, 10),
(3, 5),
(4, 8),
(5, 10),
(6, 10),
(7, 11),
(8, 12),
(9, 12),
(10, 13),
(11, 13),
(12, 13),
(13, 14),
(14, 14),
(15, 15),
(16, 15),
(17, 15),
(18, 16),
(19, 16),
(20, 16),
(21, 16),
(22, 17),
(23, 17),
(24, 19),
(25, 20),
(26, 20),
(27, 21),
(28, 21),
(29, 23),
(30, 23),
(31, 23),
(32, 23),
(33, 25),
(34, 26);

-- --------------------------------------------------------

--
-- Structure de la table `reparation`
--

DROP TABLE IF EXISTS `reparation`;
CREATE TABLE IF NOT EXISTS `reparation` (
  `id_reparation` int NOT NULL AUTO_INCREMENT,
  `id_velo` int NOT NULL,
  `id_typerep` int NOT NULL,
  `datedebut_reparation` datetime DEFAULT NULL,
  `datefin_reparation` datetime DEFAULT NULL,
  `actif_reparation` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_reparation`),
  KEY `fk_reparation__velo` (`id_velo`),
  KEY `fk_typerep__reparation` (`id_typerep`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reparation`
--

INSERT INTO `reparation` (`id_reparation`, `id_velo`, `id_typerep`, `datedebut_reparation`, `datefin_reparation`, `actif_reparation`) VALUES
(1, 1, 1, '2024-09-11 10:21:45', '2024-09-13 10:21:49', 1),
(2, 2, 2, '2024-12-09 00:00:00', '2024-09-15 10:41:10', 1),
(3, 3, 3, '2024-12-16 00:00:00', '2024-09-19 10:41:20', 1);

-- --------------------------------------------------------

--
-- Structure de la table `typerep`
--

DROP TABLE IF EXISTS `typerep`;
CREATE TABLE IF NOT EXISTS `typerep` (
  `id_typerep` int NOT NULL AUTO_INCREMENT,
  `nom_typerep` varchar(150) NOT NULL,
  `duree_typerep` int NOT NULL,
  `actif_typerep` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_typerep`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `typerep`
--

INSERT INTO `typerep` (`id_typerep`, `nom_typerep`, `duree_typerep`, `actif_typerep`) VALUES
(1, 'Test vélo', 10, 1),
(2, 'Montage un accessoire', 5, 1),
(3, 'Révision sécurité', 30, 1),
(4, 'Changement un pneu', 5, 1),
(5, 'Changement une CAA', 5, 1),
(6, 'Dévoilage une roue', 10, 1),
(7, 'Changement roue AV ou AR', 20, 1),
(8, 'Changement 1 à 3 rayons', 20, 1),
(9, 'Changement CAA/Pneu Tambour', 20, 1),
(10, 'Insert préventif', 5, 1),
(11, 'Changement paire de pédales', 5, 1),
(12, 'Changement câble/gaine déraileur', 10, 1),
(13, 'Changement boîtier de pédalier', 20, 1),
(14, 'Changement de chaîne', 10, 1),
(15, 'Changement du pédalier', 15, 1),
(16, 'Changement k7/RL', 10, 1),
(17, 'Changement manette dérailleur', 15, 1),
(18, 'Réglage dérailleur AV ou AR', 10, 1),
(19, 'Changement levier de frein VTT/VTC', 15, 1),
(20, 'Changement câble/gaine de frein', 10, 1),
(21, 'Changement pâtins de frein', 10, 1),
(22, 'Réglage des freins AV + AR', 10, 1),
(23, 'Changement étrier de frein AV ou AR', 15, 1),
(24, 'Purge frein hydraulique', 20, 1),
(25, 'Changement levier de frein velo route', 25, 1),
(26, 'Changement plaquettes freins', 10, 1);

-- --------------------------------------------------------

--
-- Structure de la table `typerep__famille_typerep`
--

DROP TABLE IF EXISTS `typerep__famille_typerep`;
CREATE TABLE IF NOT EXISTS `typerep__famille_typerep` (
  `id_typerep` int NOT NULL,
  `id_famille_typerep` int NOT NULL,
  PRIMARY KEY (`id_typerep`,`id_famille_typerep`),
  KEY `fk_typerep__famille_typerep2` (`id_famille_typerep`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `typerep__famille_typerep`
--

INSERT INTO `typerep__famille_typerep` (`id_typerep`, `id_famille_typerep`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 3),
(12, 3),
(13, 3),
(14, 3),
(15, 3),
(16, 3),
(17, 3),
(18, 3),
(19, 4),
(20, 4),
(21, 4),
(22, 4),
(23, 4),
(24, 4),
(25, 4);

-- --------------------------------------------------------

--
-- Structure de la table `type_identite`
--

DROP TABLE IF EXISTS `type_identite`;
CREATE TABLE IF NOT EXISTS `type_identite` (
  `id_type_identite` int NOT NULL AUTO_INCREMENT,
  `nom_type_identite` varchar(50) NOT NULL,
  `actif_type_identite` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_type_identite`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `type_identite`
--

INSERT INTO `type_identite` (`id_type_identite`, `nom_type_identite`, `actif_type_identite`) VALUES
(1, 'Carte d\'identité', 1),
(2, 'Passeport', 1),
(3, 'Permis', 1);

-- --------------------------------------------------------

--
-- Structure de la table `type_utilisateur`
--

DROP TABLE IF EXISTS `type_utilisateur`;
CREATE TABLE IF NOT EXISTS `type_utilisateur` (
  `id_type_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom_type_utilisateur` varchar(30) DEFAULT NULL,
  `actif_type_utilisateur` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_type_utilisateur`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `type_utilisateur`
--

INSERT INTO `type_utilisateur` (`id_type_utilisateur`, `nom_type_utilisateur`, `actif_type_utilisateur`) VALUES
(1, 'Administrateur', 1),
(2, 'Technicien', 1),
(3, 'Extérieur', 1),
(4, 'Client', 1);

-- --------------------------------------------------------

--
-- Structure de la table `type_velo`
--

DROP TABLE IF EXISTS `type_velo`;
CREATE TABLE IF NOT EXISTS `type_velo` (
  `id_type_velo` int NOT NULL AUTO_INCREMENT,
  `nom_type_velo` varchar(150) DEFAULT NULL,
  `actif_type_velo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_type_velo`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `type_velo`
--

INSERT INTO `type_velo` (`id_type_velo`, `nom_type_velo`, `actif_type_velo`) VALUES
(1, 'VTT', 1),
(2, 'VTC', 1),
(3, 'Ville', 1),
(4, 'Course', 1),
(5, 'Electrique', 1);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `id_ville` int NOT NULL,
  `id_formation` int DEFAULT NULL,
  `id_type_utilisateur` int NOT NULL,
  `nom_utilisateur` varchar(100) DEFAULT NULL,
  `prenom_utilisateur` varchar(100) DEFAULT NULL,
  `login_utilisateur` varchar(30) DEFAULT NULL,
  `mdp_utilisateur` varchar(30) DEFAULT NULL,
  `debutformation_utilisateur` date DEFAULT NULL,
  `finformation_utilisateur` date DEFAULT NULL,
  `email_utilisateur` varchar(50) DEFAULT NULL,
  `tel_utilisateur` varchar(20) DEFAULT NULL,
  `adresse_utilisateur` varchar(100) DEFAULT NULL,
  `codepostal_utilisateur` int DEFAULT NULL,
  `complementadresse_utilisateur` varchar(30) DEFAULT NULL,
  `dateinscription_utilisateur` date DEFAULT NULL,
  `dateconnexion_utilisateur` date DEFAULT NULL,
  `actif_utilisateur` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_utilisateur`),
  KEY `fk_type_utilisateur__utilisateur` (`id_type_utilisateur`),
  KEY `fk_utilisateur__formation` (`id_formation`),
  KEY `fk_ville__utilisateur` (`id_ville`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id_utilisateur`, `id_ville`, `id_formation`, `id_type_utilisateur`, `nom_utilisateur`, `prenom_utilisateur`, `login_utilisateur`, `mdp_utilisateur`, `debutformation_utilisateur`, `finformation_utilisateur`, `email_utilisateur`, `tel_utilisateur`, `adresse_utilisateur`, `codepostal_utilisateur`, `complementadresse_utilisateur`,`dateinscription_utilisateur`,`dateconnexion_utilisateur`,`actif_utilisateur`) VALUES
(1, 1, NULL, 1, 'Pagan', 'Jean-Jacques', 'j.pagan', '', '0000-00-00', '0000-00-00', 'jean-jacques.pagan@montpellier.fr', '0605080709', '12 rue Jean Mermoz', 34500, '','','', 0),
(2, 4, 2, 2, 'Dupont', 'Malik', 'm.dupont1', '', '2024-06-12', '2025-02-22', 'malik.dupont@montpellier.fr', '0612345678', '4 rue des paquerettes', 34600, '','','', 0),
(3, 2, 4, 2, 'Allard', 'Sylvain', 's.allard1', '', '2024-06-12', '2025-02-22', 'sylvain.allard@montpellier.fr', '0695285609', '12 rue Jean Mermoz', 34500, '','','', 1);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur__reparation`
--

DROP TABLE IF EXISTS `utilisateur__reparation`;
CREATE TABLE IF NOT EXISTS `utilisateur__reparation` (
  `id_utilisateur` int NOT NULL,
  `id_reparation` int NOT NULL,
  PRIMARY KEY (`id_utilisateur`,`id_reparation`),
  KEY `fk_utilisateur__reparation2` (`id_reparation`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateur__reparation`
--

INSERT INTO `utilisateur__reparation` (`id_utilisateur`, `id_reparation`) VALUES
(2, 1),
(3, 2);

-- --------------------------------------------------------

--
-- Structure de la table `velo`
--

DROP TABLE IF EXISTS `velo`;
CREATE TABLE IF NOT EXISTS `velo` (
  `id_velo` int NOT NULL AUTO_INCREMENT,
  `id_caution` int DEFAULT NULL,
  `id_modele` int NOT NULL,
  `numeroserie_velo` varchar(60) DEFAULT NULL,
  `numeroafpa_velo` varchar(60) DEFAULT NULL,
  `dispo_velo` tinyint(1) DEFAULT NULL,
  `photo_velo` varchar(120) DEFAULT NULL,
  `couleur_velo` varchar(50) DEFAULT NULL,
  `etat_velo` varchar(60) DEFAULT NULL,
  `actif_velo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_velo`),
  KEY `fk_caution__velo` (`id_caution`),
  KEY `fk_velo__modele` (`id_modele`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `velo`
--

INSERT INTO `velo` (`id_velo`, `id_caution`, `id_modele`, `numeroserie_velo`, `numeroafpa_velo`, `dispo_velo`, `photo_velo`, `couleur_velo`, `etat_velo`, `actif_velo`) VALUES
(1, 1, 1, NULL, NULL, 1, NULL, 'noir', 'ok', 1),
(2, 1, 2, NULL, NULL, 1, NULL, 'noir', 'ok', 1),
(3, 1, 3, NULL, NULL, 1, NULL, 'noir', 'ok', 1),
(4, 1, 4, NULL, NULL, 1, NULL, 'gris', 'ok', 1),
(5, 1, 5, NULL, NULL, 1, NULL, 'noir', 'ok', 1),
(6, 1, 6, NULL, NULL, 1, NULL, 'noir', 'ok', 1),
(7, 1, 7, NULL, NULL, 1, NULL, 'gris', 'ok', 1),
(8, 1, 8, NULL, NULL, 1, NULL, 'bleu', 'ok', 1),
(9, 1, 9, NULL, NULL, 1, NULL, 'violet', 'ok', 1),
(10, 1, 3, NULL, NULL, 1, NULL, 'bleu', 'ok', 1),
(11, 1, 10, NULL, NULL, 1, NULL, 'gris', 'ok', 1),
(12, 1, 11, NULL, NULL, 1, NULL, 'rose', 'ok', 1),
(13, 1, 12, NULL, NULL, 1, NULL, 'bleu', 'ok', 1),
(14, 1, 13, NULL, NULL, 1, NULL, 'vert', 'ok', 1);

-- --------------------------------------------------------

--
-- Structure de la table `velo__accessoire`
--

DROP TABLE IF EXISTS `velo__accessoire`;
CREATE TABLE IF NOT EXISTS `velo__accessoire` (
  `id_accessoire` int NOT NULL,
  `id_velo` int NOT NULL,
  PRIMARY KEY (`id_accessoire`,`id_velo`),
  KEY `fk_velo__accessoire2` (`id_velo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `velo__accessoire`
--

INSERT INTO `velo__accessoire` (`id_accessoire`, `id_velo`) VALUES
(1, 1),
(2, 8);

-- --------------------------------------------------------

--
-- Structure de la table `ville`
--

DROP TABLE IF EXISTS `ville`;
CREATE TABLE IF NOT EXISTS `ville` (
  `id_ville` int NOT NULL AUTO_INCREMENT,
  `nom_ville` varchar(60) DEFAULT NULL,
  `actif_ville` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_ville`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ville`
--

INSERT INTO `ville` (`id_ville`, `nom_ville`, `actif_ville`) VALUES
(1, 'Montpellier', 1),
(2, 'Saint-Jean de Vedas', 1),
(3, 'Juvignac', 1),
(4, 'Lattes', 1),
(5, 'Castelnau-le-Lez', 1),
(6, 'Grabels', 1),
(7, 'Fabrègues', 1),
(8, 'Mauguio', 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
