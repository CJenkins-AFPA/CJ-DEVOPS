<?php
require_once "initialize.php";

/**
 * Class modele_service | file modele_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_modele()
 * - updating a user with method update_modele()
 * - deleting a user with method supprime_modele()
 * - listing all users with method liste_modele()
 * - editing a user with method edit_modele()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "modele_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Modele_service extends Initialize	{
	
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
	 * Method save_modele()
	 *
	 * Insert a new user in database
	 */
	public function modele_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "modele_insert.sql";
		$this->resultat["modele_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_modele" => $this->VARS_HTML["nom_modele"],
																	"actif_modele" => $this->VARS_HTML["actif_modele"],
																	"id_type_velo" => $this->VARS_HTML["id_type_velo"],
																	"id_marque" => $this->VARS_HTML["id_marque"]
																	));
		$this->resultat["id_modele_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method modele_liste()
	 *
	 * List all bikes in database
	 */
	public function modele_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "modele_select.sql";
		$this->resultat["modele_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	public function modele_type_velo_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "modele_type_velo_select.sql";
		$this->resultat["modele_type_velo_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	public function modele_marque_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "modele_marque_select.sql";
		$this->resultat["modele_marque_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_modele()
	 *
	 * Edit the user with param id_modele from the database
	 */
	public function edit_modele(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_modele_single.sql";
		$this->resultat["edit_modele"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_modele" => $this->VARS_HTML["id_modele"] ));

	}

	/**
	 * Method modele_delete()
	 *
	 * Delete a user in database
	 */
	public function modele_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "modele_delete.sql";
		$this->resultat["modele_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_modele" => $this->VARS_HTML["id_modele"]
																	));

	}

	/**
	 * Method modele_update()
	 *
	 * Update the user with param id_modele in database
	 */
	public function modele_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "modele_update.sql";
		$this->resultat["modele_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_modele" => $this->VARS_HTML["id_modele"],
																	"id_type_velo" => $this->VARS_HTML["id_type_velo"], 
																	"id_marque" => $this->VARS_HTML["id_marque"], 
																	"id_modele" => $this->VARS_HTML["id_modele"], 
																	"nom_modele" => $this->VARS_HTML["nom_modele"],
																	"actif_modele" => $this->VARS_HTML["actif_modele"]
																	));

	}
}

?>
