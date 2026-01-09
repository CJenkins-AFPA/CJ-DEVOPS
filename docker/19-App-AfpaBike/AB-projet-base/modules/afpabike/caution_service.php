<?php
require_once "initialize.php";

/**
 * Class caution_service | file caution_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_caution()
 * - updating a user with method update_caution()
 * - deleting a user with method supprime_caution()
 * - listing all users with method liste_caution()
 * - editing a user with method edit_caution()
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "caution_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Caution_service extends Initialize	{
	
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
	 * Method save_caution()
	 *
	 * Insert a new caution in database
	 */
	public function caution_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "caution_insert.sql";
		$this->resultat["caution_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"libelle_caution" => $this->VARS_HTML["libelle_caution"],
																	"montant_caution" => $this->VARS_HTML["montant_caution"],
																	"actif_caution" => $this->VARS_HTML["actif_caution"]
																	));
		$this->resultat["id_caution_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method caution_liste()
	 *
	 * List all bikes in database
	 */
	public function caution_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "caution_select.sql";
		$this->resultat["caution_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_caution()
	 *
	 * Edit the user with param id_caution from the database
	 */
	public function edit_caution(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_caution_single.sql";
		$this->resultat["edit_caution"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_caution" => $this->VARS_HTML["id_caution"] ));

	}

	/**
	 * Method supprime_caution()
	 *
	 * Delete a user in database
	 */
	public function caution_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "caution_delete.sql";
		$this->resultat["caution_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_caution" => $this->VARS_HTML["id_caution"]
																	));

	}

	/**
	 * Method update_caution()
	 *
	 * Update the user with param id_caution in database
	 */
	public function caution_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "caution_update.sql";
		$this->resultat["caution_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_caution" => $this->VARS_HTML["id_caution"],
																	"libelle_caution" => $this->VARS_HTML["libelle_caution"],
																	"montant_caution" => $this->VARS_HTML["montant_caution"], 
																	"actif_caution" => $this->VARS_HTML["actif_caution"]
																	));

	}
}

?>
