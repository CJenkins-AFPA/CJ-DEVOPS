<?php
require_once "initialize.php";

/**
 * Class velo_service | file velo_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_velo()
 * - updating a user with method update_velo()
 * - deleting a user with method supprime_velo()
 * - listing all users with method liste_velo()
 * - editing a user with method edit_velo()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "velo_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Velo_service extends Initialize	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
	public $VARS_HTML;

	/**
	 * Call the parent constructor
	 *
	 * init variables resultat
	 */
	public function __construct()	{
		// Call Parent Constructor
		parent::__construct();

		// init variables resultat
		$this->resultat= [];
	}

	/**
	 * Call the parent destructor
	 */
	public function __destruct()	{
		// Call Parent destructor
		parent::__destruct();
	}

	/**
	 * Method save_velo()
	 *
	 * Insert a new user in database
	 */
	public function save_velo()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "insert_velo.sql";
		$this->resultat["save_velo"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_caution" => $this->VARS_HTML["id_caution"], 
																	"id_modele" => $this->VARS_HTML["id_modele"], 
																	"numeroserie_velo" => $this->VARS_HTML["numeroserie_velo"],
																	"numeroafpa_velo" => $this->VARS_HTML["numeroafpa_velo"],
																	"dispo_velo" => $this->VARS_HTML["dispo_velo"],
																	"photo_velo" => $this->VARS_HTML["photo_velo"],
																	"couleur_velo" => $this->VARS_HTML["couleur_velo"],
																	"etat_velo" => $this->VARS_HTML["etat_velo"],
																	"actif_velo" => $this->VARS_HTML["actif_velo"]
																	));
		$this->resultat["id_velo_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method velo_liste()
	 *
	 * List all bikes in database
	 */
	public function velo_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_velo.sql";
		$this->resultat["velo_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method velo_marque_liste()
	 *
	 * List all marques in database
	 */
	public function velo_marque_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_velo_marque.sql";
		$this->resultat["velo_marque_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method velo_modele_liste()
	 *
	 * List all models in database
	 */
	public function velo_modele_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_velo_modele.sql";
		$this->resultat["velo_modele_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method velo_type_liste()
	 *
	 * List all types in database
	 */
	public function velo_type_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_velo_type.sql";
		$this->resultat["velo_type_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_velo()
	 *
	 * Edit the user with param id_velo from the database
	 */
	public function edit_velo(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_velo_single.sql";
		$this->resultat["edit_velo"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_velo" => $this->VARS_HTML["id_velo"] ));

	}

	/**
	 * Method supprime_velo()
	 *
	 * Delete a user in database
	 */
	public function supprime_velo(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "delete_velo.sql";
		$this->resultat["supprime_velo"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_velo" => $this->VARS_HTML["id_velo"]
																	));

	}

	/**
	 * Method update_velo()
	 *
	 * Update the user with param id_velo in database
	 */
	public function update_velo(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "update_velo.sql";
		$this->resultat["update_velo"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_velo" => $this->VARS_HTML["id_velo"], 
																	"id_caution" => $this->VARS_HTML["id_caution"], 
																	"id_modele" => $this->VARS_HTML["id_modele"], 
																	"numeroserie_velo" => $this->VARS_HTML["numeroserie_velo"],
																	"numeroafpa_velo" => $this->VARS_HTML["numeroafpa_velo"],
																	"dispo_velo" => $this->VARS_HTML["dispo_velo"],
																	"photo_velo" => $this->VARS_HTML["photo_velo"],
																	"couleur_velo" => $this->VARS_HTML["couleur_velo"],
																	"etat_velo" => $this->VARS_HTML["etat_velo"],
																	"actif_velo" => $this->VARS_HTML["actif_velo"]
																	));

	}
}

?>
