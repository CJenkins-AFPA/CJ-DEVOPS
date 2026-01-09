<?php
require_once "initialize.php";

/**
 * Class type_utilisateur_service | file type_utilisateur_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_type_utilisateur()
 * - updating a user with method update_type_utilisateur()
 * - deleting a user with method supprime_type_utilisateur()
 * - listing all users with method liste_type_utilisateur()
 * - editing a user with method edit_type_utilisateur()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "type_utilisateur_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_utilisateur_service extends Initialize	{
	
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
	 * Method save_type_utilisateur()
	 *
	 * Insert a new type_utilisateur in database
	 */
	public function type_utilisateur_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_utilisateur_insert.sql";
		$this->resultat["type_utilisateur_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_type_utilisateur" => $this->VARS_HTML["nom_type_utilisateur"],
																	"actif_type_utilisateur" => $this->VARS_HTML["actif_type_utilisateur"]
																	));
		$this->resultat["id_type_utilisateur_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method type_utilisateur_liste()
	 *
	 * List all bikes in database
	 */
	public function type_utilisateur_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_utilisateur_select.sql";
		$this->resultat["type_utilisateur_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_type_utilisateur()
	 *
	 * Edit the user with param id_type_utilisateur from the database
	 */
	public function edit_type_utilisateur(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_type_utilisateur_single.sql";
		$this->resultat["edit_type_utilisateur"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_type_utilisateur" => $this->VARS_HTML["id_type_utilisateur"] ));

	}

	/**
	 * Method supprime_type_utilisateur()
	 *
	 * Delete a user in database
	 */
	public function type_utilisateur_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_utilisateur_delete.sql";
		$this->resultat["type_utilisateur_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_type_utilisateur" => $this->VARS_HTML["id_type_utilisateur"]
																	));

	}

	/**
	 * Method update_type_utilisateur()
	 *
	 * Update the user with param id_type_utilisateur in database
	 */
	public function type_utilisateur_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_utilisateur_update.sql";
		$this->resultat["type_utilisateur_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_type_utilisateur" => $this->VARS_HTML["id_type_utilisateur"],
																	"nom_type_utilisateur" => $this->VARS_HTML["nom_type_utilisateur"], 
																	"actif_type_utilisateur" => $this->VARS_HTML["actif_type_utilisateur"]
																	));

	}
}

?>
