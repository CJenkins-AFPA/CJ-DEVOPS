<?php
require_once "initialize.php";

/**
 * Class type_velo_service | file type_velo_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_type_velo()
 * - updating a user with method update_type_velo()
 * - deleting a user with method supprime_type_velo()
 * - listing all users with method liste_type_velo()
 * - editing a user with method edit_type_velo()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "type_velo_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_velo_service extends Initialize	{
	
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
	 * Method save_type_velo()
	 *
	 * Insert a new type_velo in database
	 */
	public function type_velo_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_velo_insert.sql";
		$this->resultat["type_velo_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_type_velo" => $this->VARS_HTML["nom_type_velo"],
																	"actif_type_velo" => $this->VARS_HTML["actif_type_velo"]
																	));
		$this->resultat["id_type_velo_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method type_velo_liste()
	 *
	 * List all bikes in database
	 */
	public function type_velo_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_velo_select.sql";
		$this->resultat["type_velo_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_type_velo()
	 *
	 * Edit the user with param id_type_velo from the database
	 */
	public function edit_type_velo(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_type_velo_single.sql";
		$this->resultat["edit_type_velo"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_type_velo" => $this->VARS_HTML["id_type_velo"] ));

	}

	/**
	 * Method supprime_type_velo()
	 *
	 * Delete a user in database
	 */
	public function type_velo_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_velo_delete.sql";
		$this->resultat["type_velo_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_type_velo" => $this->VARS_HTML["id_type_velo"]
																	));

	}

	/**
	 * Method update_type_velo()
	 *
	 * Update the user with param id_type_velo in database
	 */
	public function type_velo_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_velo_update.sql";
		$this->resultat["type_velo_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_type_velo" => $this->VARS_HTML["id_type_velo"],
																	"nom_type_velo" => $this->VARS_HTML["nom_type_velo"], 
																	"actif_type_velo" => $this->VARS_HTML["actif_type_velo"]
																	));

	}
}

?>
