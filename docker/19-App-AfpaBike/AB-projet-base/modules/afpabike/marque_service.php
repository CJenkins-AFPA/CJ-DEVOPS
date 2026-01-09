<?php
require_once "initialize.php";

/**
 * Class marque_service | file marque_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_marque()
 * - updating a user with method update_marque()
 * - deleting a user with method supprime_marque()
 * - listing all users with method liste_marque()
 * - editing a user with method edit_marque()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "marque_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Marque_service extends Initialize	{
	
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
	 * Method save_marque()
	 *
	 * Insert a new marque in database
	 */
	public function marque_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "marque_insert.sql";
		$this->resultat["marque_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_marque" => $this->VARS_HTML["nom_marque"],
																	"actif_marque" => $this->VARS_HTML["actif_marque"]
																	));
		$this->resultat["id_marque_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method marque_liste()
	 *
	 * List all bikes in database
	 */
	public function marque_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "marque_select.sql";
		$this->resultat["marque_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_marque()
	 *
	 * Edit the user with param id_marque from the database
	 */
	public function edit_marque(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_marque_single.sql";
		$this->resultat["edit_marque"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_marque" => $this->VARS_HTML["id_marque"] ));

	}

	/**
	 * Method supprime_marque()
	 *
	 * Delete a user in database
	 */
	public function marque_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "marque_delete.sql";
		$this->resultat["marque_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_marque" => $this->VARS_HTML["id_marque"]
																	));

	}

	/**
	 * Method update_marque()
	 *
	 * Update the user with param id_marque in database
	 */
	public function marque_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "marque_update.sql";
		$this->resultat["marque_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_marque" => $this->VARS_HTML["id_marque"],
																	"nom_marque" => $this->VARS_HTML["nom_marque"], 
																	"actif_marque" => $this->VARS_HTML["actif_marque"]
																	));

	}
}

?>
