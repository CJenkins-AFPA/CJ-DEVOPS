<?php
require_once "initialize.php";

/**
 * Class formation_service | file formation_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_formation()
 * - updating a user with method update_formation()
 * - deleting a user with method supprime_formation()
 * - listing all users with method liste_formation()
 * - editing a user with method edit_formation()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "formation_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Formation_service extends Initialize	{
	
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
	 * Method save_formation()
	 *
	 * Insert a new formation in database
	 */
	public function formation_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "formation_insert.sql";
		$this->resultat["formation_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_formation" => $this->VARS_HTML["nom_formation"],
																	"actif_formation" => $this->VARS_HTML["actif_formation"]
																	));
		$this->resultat["id_formation_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method formation_liste()
	 *
	 * List all bikes in database
	 */
	public function formation_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "formation_select.sql";
		$this->resultat["formation_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_formation()
	 *
	 * Edit the user with param id_formation from the database
	 */
	public function edit_formation(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_formation_single.sql";
		$this->resultat["edit_formation"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_formation" => $this->VARS_HTML["id_formation"] ));

	}

	/**
	 * Method supprime_formation()
	 *
	 * Delete a user in database
	 */
	public function formation_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "formation_delete.sql";
		$this->resultat["formation_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_formation" => $this->VARS_HTML["id_formation"]
																	));

	}

	/**
	 * Method update_formation()
	 *
	 * Update the user with param id_formation in database
	 */
	public function formation_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "formation_update.sql";
		$this->resultat["formation_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_formation" => $this->VARS_HTML["id_formation"],
																	"nom_formation" => $this->VARS_HTML["nom_formation"], 
																	"actif_formation" => $this->VARS_HTML["actif_formation"]
																	));

	}
}

?>
