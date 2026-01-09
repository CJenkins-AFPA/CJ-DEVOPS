<?php
require_once "initialize.php";

/**
 * Class type_rep_service | file type_rep_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_type_rep()
 * - updating a user with method update_type_rep()
 * - deleting a user with method supprime_type_rep()
 * - listing all users with method liste_type_rep()
 * - editing a user with method edit_type_rep()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "type_rep_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_rep_service extends Initialize	{
	
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
	 * Method save_type_rep()
	 *
	 * Insert a new type_rep in database
	 */
	public function type_rep_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_rep_insert.sql";
		$this->resultat["type_rep_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_typerep" => $this->VARS_HTML["nom_typerep"],
																	"duree_typerep" => $this->VARS_HTML["duree_typerep"],
																	"actif_typerep" => $this->VARS_HTML["actif_typerep"]
																	));
		$this->resultat["id_type_rep_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method type_rep_liste()
	 *
	 * List all bikes in database
	 */
	public function type_rep_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_rep_select.sql";
		$this->resultat["type_rep_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_type_rep()
	 *
	 * Edit the user with param id_type_rep from the database
	 */
	public function edit_type_rep(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_type_rep_single.sql";
		$this->resultat["edit_type_rep"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_typerep" => $this->VARS_HTML["id_typerep"] ));

	}

	/**
	 * Method supprime_type_rep()
	 *
	 * Delete a user in database
	 */
	public function type_rep_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_rep_delete.sql";
		$this->resultat["type_rep_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_typerep" => $this->VARS_HTML["id_typerep"]
																	));

	}

	/**
	 * Method update_type_rep()
	 *
	 * Update the user with param id_type_rep in database
	 */
	public function type_rep_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_rep_update.sql";
		$this->resultat["type_rep_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_typerep" => $this->VARS_HTML["id_typerep"],
																	"nom_typerep" => $this->VARS_HTML["nom_typerep"],
																	"duree_typerep" => $this->VARS_HTML["duree_typerep"], 
																	"actif_typerep" => $this->VARS_HTML["actif_typerep"]
																	));

	}
}

?>
