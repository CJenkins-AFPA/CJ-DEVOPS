<?php
require_once "initialize.php";
class Entretien_service extends Initialize	{
	
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
	 * Method save_entretien()
	 *
	 * Insert a new movie in database
	 */
	public function save_entretien()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "insert_entretien.sql";
		$this->resultat["save_entretien"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_velo" => $this->VARS_HTML["id_velo"], 
																	"id_typerep" => $this->VARS_HTML["id_typerep"]
																	));
		$this->resultat["id_reparation_created"]= $this->oBdd->getLastInsertId();

	}
	public function entretien_velo_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "entretien_velo_select.sql";
		$this->resultat["entretien_velo_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	public function entretien_reparation_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "entretien_reparation_select.sql";
		$this->resultat["entretien_reparation_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}
	/**
	 * Method liste_entretien()
	 *
	 * List all movies in database
	 */
	public function liste_entretien()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_entretien.sql";
		$this->resultat["liste_entretien"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_entretien()
	 *
	 * Edit the movie with param id_entretien from the database
	 */
	public function edit_entretien(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_entretien.sql";
		$this->resultat["edit_entretien"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_reparation" => $this->VARS_HTML["id_reparation"] ));

	}
	public function entretien_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "update_entretien.sql";
		$this->resultat["entretien_update"]= $this->oBdd->treatDatas($spathSQL, array(
																		"id_reparation" => $this->VARS_HTML["id_reparation"], 
																		"id_velo" => $this->VARS_HTML["id_velo"], 
																		"id_typerep" => $this->VARS_HTML["id_typerep"]
																	));
		if ($this->resultat["entretien_update"] != "") {
			$this->resultat["error"]= 1;
		}  else  {
			$this->resultat["error"]= "";
		}

	}
	public function supprime_entretien(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "delete_entretien.sql";
		$this->resultat["supprime_entretien"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_reparation" => $this->VARS_HTML["id_reparation"],
																	));
																															
		if ($this->resultat["supprime_entretien"] != "") {
			$this->resultat["error"]= 1;
		}  else  {
			$this->resultat["error"]= "";
		}

	}
}
    ?>