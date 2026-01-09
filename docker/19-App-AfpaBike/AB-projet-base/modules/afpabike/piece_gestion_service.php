<?php
require_once "initialize.php";

/**
 * Class piece_gestion_service | file piece_gestion_service.php
 *
 * In this class, we have methods for :
 * - adding a movie with method save_piece_gestion()
 * - updating a movie with method update_piece_gestion()
 * - deleting a movie with method supprime_piece_gestion()
 * - listing all movies with method liste_piece_gestion()
 * - editing a movie with method edit_piece_gestion()
 * With this interface, we'll be able to list all the piece_gestions stored in database
 *
 * List of classes needed for this class
 *
 * require_once "piece_gestion_service.php";
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Piece_gestion_service extends Initialize	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;

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
	 * Method save_piece_gestion()
	 *
	 * Insert a new movie in database
	 */
	public function save_piece_gestion()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "insert_piece_gestion.sql";
		$this->resultat["save_piece_gestion"]= $this->oBdd->treatDatas($spathSQL, array(
																	"titre_piece_gestion" => $this->VARS_HTML["titre_piece_gestion"], 
																	"date_piece_gestion" => $this->VARS_HTML["date_piece_gestion"], 
																	"duree_piece_gestion" => $this->VARS_HTML["duree_piece_gestion"]
																	));
		$this->resultat["id_piece_gestion_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method liste_piece_gestion()
	 *
	 * List all movies in database
	 */
	public function liste_piece_gestion()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_piece_gestion.sql";
		$this->resultat["liste_piece_gestion"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_piece_gestion()
	 *
	 * Edit the movie with param id_piece_gestion from the database
	 */
	public function edit_piece_gestion(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_piece_gestion_single.sql";
		$this->resultat["edit_piece_gestion"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_piece_gestion" => $this->VARS_HTML["id_piece_gestion"] ));

	}

	/**
	 * Method supprime_piece_gestion()
	 *
	 * Delete a movie in database
	 */
	public function supprime_piece_gestion(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "delete_piece_gestion.sql";
		$this->resultat["supprime_piece_gestion"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_piece_gestion" => $this->VARS_HTML["id_piece_gestion"]
																	));

	}

	/**
	 * Method update_piece_gestion()
	 *
	 * Update the movie with param id_piece_gestion in database
	 */
	public function update_piece_gestion(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "update_piece_gestion.sql";
		$this->resultat["update_piece_gestion"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_piece_gestion" => $this->VARS_HTML["id_piece_gestion"], 
																	"titre_piece_gestion" => $this->VARS_HTML["titre_piece_gestion"], 
																	"date_piece_gestion" => $this->VARS_HTML["date_piece_gestion"], 
																	"duree_piece_gestion" => $this->VARS_HTML["duree_piece_gestion"]
																	));

	}
}

?>
