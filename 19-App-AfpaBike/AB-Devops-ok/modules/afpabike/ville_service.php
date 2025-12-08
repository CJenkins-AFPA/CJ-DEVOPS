<?php
require_once "initialize.php";

/**
 * Class ville_service | file ville_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_ville()
 * - updating a user with method update_ville()
 * - deleting a user with method supprime_ville()
 * - listing all users with method liste_ville()
 * - editing a user with method edit_ville()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "ville_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Ville_service extends Initialize	{
	
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
	 * Method save_ville()
	 *
	 * Insert a new ville in database
	 */
	public function ville_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "ville_insert.sql";
		$this->resultat["ville_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_ville" => $this->VARS_HTML["nom_ville"],
																	"actif_ville" => $this->VARS_HTML["actif_ville"]
																	));
		$this->resultat["id_ville_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method ville_liste()
	 *
	 * List all bikes in database
	 */
	public function ville_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "ville_select.sql";
		$this->resultat["ville_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_ville()
	 *
	 * Edit the user with param id_ville from the database
	 */
	public function edit_ville(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_ville_single.sql";
		$this->resultat["edit_ville"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_ville" => $this->VARS_HTML["id_ville"] ));

	}

	/**
	 * Method supprime_ville()
	 *
	 * Delete a user in database
	 */
	public function ville_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "ville_delete.sql";
		$this->resultat["ville_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_ville" => $this->VARS_HTML["id_ville"]
																	));

	}

	/**
	 * Method update_ville()
	 *
	 * Update the user with param id_ville in database
	 */
	public function ville_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "ville_update.sql";
		$this->resultat["ville_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_ville" => $this->VARS_HTML["id_ville"],
																	"nom_ville" => $this->VARS_HTML["nom_ville"], 
																	"actif_ville" => $this->VARS_HTML["actif_ville"]
																	));

	}
}

?>
