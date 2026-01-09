<?php
require_once "entretien_service.php";

/**
 * Classe entretien_save | fichier entretien_save.php
 *
 * Cette classe affiche l'interface "entretien_save.html" et permet d'enregistrer un nouvel entretien.
 *
 * @package AFPA Bike
 * @subpackage Configuration
 * @author Afpa Lab Team
 * @copyright 1920-2080 The Afpa Lab Team
 * @version v1.0
 */
class Entretien_save {

    /**
     * Variable publique utilisée pour stocker les données nécessaires pour les templates HTML.
     * @var array
     */
    public $resultat;

    /**
     * Variable publique utilisée pour stocker les données POST ou GET.
     * @var array
     */
    public $VARS_HTML;

    /**
     * Constructeur : initialise les variables et exécute la méthode principale.
     */
    public function __construct() {
        // Initialisation de la variable $resultat
        $this->resultat = [];

        // Appel à la méthode principale
        $this->main();
    }

    /**
     * Fonction principale qui permet d'ajouter un entretien dans la base de données.
     */
    public function main() {
        // Création d'un nouvel objet du service d'entretien
        $obj_entretien_service = new Entretien_service();

        // Sauvegarde de l'entretien
        $obj_entretien_service->save_entretien();

        // Stockage du résultat dans la variable $resultat
        $this->resultat = $obj_entretien_service->resultat;
        $this->VARS_HTML = $obj_entretien_service->VARS_HTML;

        // Ajout d'une entrée dans $VARS_HTML pour indiquer la page actuelle
        $this->VARS_HTML["page"] = "entretien_save";
    }
}
?>
