<?php
require_once "initialize.php";

/**
 * Class accessoire_service | file accessoire_service.php
 *
 * In this class, we have methods for :
 * - adding a movie with method save_film()
 * - updating a movie with method update_film()
 * - deleting a movie with method supprime_film()
 * - listing all movies with method liste_film()
 * - editing a movie with method edit_film()
 * With this interface, we'll be able to list all the films stored in database
 *
 * List of classes needed for this class
 *
 * require_once "accessoire_service.php";
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Accessoire_service extends Initialize	{
	
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
	 * Method save_accessoire()
	 *
	 * Insert a new movie in database
	 */
	public function accessoire_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "insert_accessoire.sql";
		$this->resultat["accessoire_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"nom_accessoire" => $this->VARS_HTML["nom_accessoire"], 
																	"etat_accessoire" => $this->VARS_HTML["etat_accessoire"], 
																	"dispo_accessoire" => $this->VARS_HTML["dispo_accessoire"], 
																	"couleur_accessoire" => $this->VARS_HTML["couleur_accessoire"],
																	"numeroserie_accessoire" => $this->VARS_HTML["numeroserie_accessoire"], 
																	"prix_accessoire" => $this->VARS_HTML["prix_accessoire"], 
																	"taille_accessoire" => $this->VARS_HTML["taille_accessoire"], 
																	"particularite_accessoire" => $this->VARS_HTML["particularite_accessoire"],  
																	"numeroafpa_accessoire" => $this->VARS_HTML["numeroafpa_accessoire"]
																	));
		if ($this->resultat["accessoire_save"] != "")	{
			$this->resultat["accessoire_save"]["error"]= 1;
		}  else  {
			$this->resultat["accessoire_save"]["error"]= "";
		}
		$this->resultat["id_accessoire_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method liste_film()
	 *
	 * List all movies in database
	 */
	public function accessoire_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_accessoire.sql";
		$this->resultat["accessoire_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	/**
	 * Method edit_film()
	 *
	 * Edit the movie with param id_accessoire from the database
	 */
	public function edit_accessoire(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_accessoire_single.sql";
		$this->resultat["edit_accessoire"]= $this->oBdd->getSelectDatas($spathSQL, array( "id_accessoire" => $this->VARS_HTML["id_accessoire"] ));

	}

	/**
	 * Method supprime_film()
	 *
	 * Delete a movie in database
	 */
	public function supprime_accessoire(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "delete_accessoire.sql";
		$this->resultat["supprime_accessoire"]= $this->oBdd->treatDatas($spathSQL, array(
			                                        //  prendre  le VARS_HTML le metre dans tous les php
													//  prendre  le VARS_HTML le metre dans tous les php
																	"id_accessoire" => $this->VARS_HTML["id_accessoire"]
																	));

	}

	/**
	 * Method update_film()
	 *
	 * Update the movie with param id_accessoire in database
	 */
	public function update_accessoire(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "update_accessoire.sql";
		$this->resultat["update_accessoire"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_accessoire" => $this->VARS_HTML["id_accessoire"], 
																	"nom_accessoire" => $this->VARS_HTML["nom_accessoire"],
																	"etat_accessoire" => $this->VARS_HTML["etat_accessoire"], 
																	"dispo_accessoire" => $this->VARS_HTML["dispo_accessoire"], 
																	"photo_accessoire" => $this->VARS_HTML["photo_accessoire"], 
																	"couleur_accessoire" => $this->VARS_HTML["couleur_accessoire"],
																	"numeroserie_accessoire" => $this->VARS_HTML["numeroserie_accessoire"], 
																	"prix_accessoire" => $this->VARS_HTML["prix_accessoire"], 
																	"taille_accessoire" => $this->VARS_HTML["taille_accessoire"], 
																	"particularite_accessoire" => $this->VARS_HTML["particularite_accessoire"],
																	"numeroafpa_accessoire" => $this->VARS_HTML["numeroafpa_accessoire"]   
																	
																	));

	}
}

?>
                                                                   