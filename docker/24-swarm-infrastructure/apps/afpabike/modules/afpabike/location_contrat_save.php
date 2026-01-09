<?php
require_once "location_service.php";

/**
 * Class location_contrat_save | file location_contrat_save.php
 *
 * In this class, we show the interface "location_contrat_save.html".
 * With this interface, we'll be able to save a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_contrat_save	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
	/**
    * public $VARS_HTML is used to store all datas needed POST or GET
    * @var array
    */
    public $VARS_HTML;
	// Déclaration de la variable d'instance privée pour stocker le nombre d'erreurs
	private $NbError;

	/**
	 * init variables resultat
	 *
	 * execute main function
	 */
	public function __construct()	{
		// init variables resultat
		$this->resultat= [];

		// execute main function
		$this->main();
	}

	/**
	 * Add a location_contrat in the database
	 */
	function main() {
		// Création d'une nouvelle instance de Location_service
		// Cette classe est probablement responsable de gérer les actions liées aux contrats de location.
		$obj_location_contrat_save = new Location_service();
		
		// Récupération des variables HTML envoyées via le formulaire ou une requête HTTP
		// et assignation à la propriété $VARS_HTML de l'objet courant (probablement pour faciliter l'accès aux données du formulaire).
		$this->VARS_HTML = $obj_location_contrat_save->VARS_HTML;
		
		// Initialisation des valeurs de retour dans le tableau "resultat".
		// On prépare ici à stocker l'ID du contrat créé, les erreurs de saisie, et d'autres informations relatives à la sauvegarde du contrat.
		$this->resultat["id_contrat_created"] = ""; // Préparation d'un champ pour l'ID du contrat créé
		$this->resultat["errorsaisie"] = ""; // Préparation d'un champ pour gérer les erreurs de saisie éventuelles
		$this->resultat["location_contrat_save"] = []; // Initialisation d'un tableau pour les résultats de la sauvegarde
		$this->resultat["location_contrat_save"]["error"] = ""; // Préparation pour capturer les erreurs liées à la sauvegarde
	
		// Appel de la méthode ContratLoc, qui semble gérer la logique pour remplir les données du contrat de location.
		$this->ContratLoc();
	
		// Vérifie si aucune erreur n'a été rencontrée (NbError doit être initialisée et gérée ailleurs dans la classe).
		if ($this->NbError == 0) {
			// Si aucune erreur, on appelle la méthode location_contrat_save qui sauvegarde les données du contrat de location.
			$obj_location_contrat_save->location_contrat_save();
	
			// On récupère ensuite les résultats de cette sauvegarde dans l'attribut $resultat de l'objet courant.
			$this->resultat = $obj_location_contrat_save->resultat;
	
			// Réinitialise le champ errorsaisie car il n'y a pas eu d'erreurs.
			$this->resultat["errorsaisie"] = "";
		}
	}
	
	private function ContratLoc() {
		// Initialisation du compteur d'erreurs à 0 au début de la fonction
		$this->NbError = 0;
	
		// Initialisation d'un tableau pour stocker les champs où des erreurs de saisie sont détectées
		$aofError = [];
	
		// Vérification que l'identifiant de l'utilisateur (id_utilisateur) est bien défini et non vide
		if (!(isset($this->VARS_HTML["id_utilisateur"])) || ($this->VARS_HTML["id_utilisateur"] == "")) {
			// Incrémente le compteur d'erreurs si la condition n'est pas remplie
			$this->NbError++;
			// Ajoute "id_utilisateur" à la liste des champs en erreur
			$aofError[] = "id_utilisateur";
		}
	
		// Vérification que l'identifiant du vélo (id_velo) est bien défini et non vide
		if (!(isset($this->VARS_HTML["id_velo"])) || ($this->VARS_HTML["id_velo"] == "")) {
			// Incrémente le compteur d'erreurs si la condition n'est pas remplie
			$this->NbError++;
			// Ajoute "velo_datalist" à la liste des champs en erreur
			$aofError[] = "velo_datalist";
		}
	
		// Vérification que la date de début du contrat (datedebut_loc_contrat) est bien définie et non vide
		if (!(isset($this->VARS_HTML["datedebut_loc_contrat"])) || ($this->VARS_HTML["datedebut_loc_contrat"] == "")) {
			// Incrémente le compteur d'erreurs si la condition n'est pas remplie
			$this->NbError++;
			// Ajoute "datedebut_loc_contrat" à la liste des champs en erreur
			$aofError[] = "datedebut_loc_contrat";
		}
	
		// Vérification que la date de fin du contrat (datefin_loc_contrat) est bien définie et non vide
		if (!(isset($this->VARS_HTML["datefin_loc_contrat"])) || ($this->VARS_HTML["datefin_loc_contrat"] == "")) {
			// Incrémente le compteur d'erreurs si la condition n'est pas remplie
			$this->NbError++;
			// Ajoute "datefin_loc_contrat" à la liste des champs en erreur
			$aofError[] = "datefin_loc_contrat";
		}
	
		// Vérification que le type d'identité (id_type_identite) est bien défini et non vide
		if (!(isset($this->VARS_HTML["id_type_identite"])) || ($this->VARS_HTML["id_type_identite"] == "")) {
			// Incrémente le compteur d'erreurs si la condition n'est pas remplie
			$this->NbError++;
			// Ajoute "id_type_identite" à la liste des champs en erreur
			$aofError[] = "id_type_identite";
		}
	
		// Vérification que le numéro d'identité (numeroidentite_contrat) est bien défini et non vide
		if (!(isset($this->VARS_HTML["numeroidentite_contrat"])) || ($this->VARS_HTML["numeroidentite_contrat"] == "")) {
			// Incrémente le compteur d'erreurs si la condition n'est pas remplie
			$this->NbError++;
			// Ajoute "numeroidentite_contrat" à la liste des champs en erreur
			$aofError[] = "numeroidentite_contrat";
		}
	
		// Enregistre la liste des erreurs de saisie sous forme de chaîne séparée par des pipes "|"
		$this->resultat["errorsaisie"] = implode("|", $aofError);
	}
}	
?>
