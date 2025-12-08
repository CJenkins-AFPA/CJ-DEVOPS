<?php
require_once "initialize.php";

/**
 * Class Location_service | file location_service.php
 *
 * In this class, we have methods for :
 * - adding location with method save_location()
 * - updating location with method update_location()
 * - deleting location with method supprime_location()
 * - listing location with method liste_location()
 * - editing location with method edit_location()
 * With this interface, we'll be able to list all the locations stored in database
 *
 * List of classes needed for this class
 *
 * require_once "location_service.php";
 *
 * @package AFPA Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_service extends Initialize	{
	
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
     * Method location_xxx_liste()
     *
     * List all location_xxx in database
     */
    public function location_retour_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_retour_select.sql";
        $this->resultat["location_retour_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
	public function location_gestion_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_gestion_select.sql";
        $this->resultat["location_gestion_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
    public function location_formation_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_formation_select.sql";
        $this->resultat["location_formation_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
    public function location_velo_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_velo_select.sql";
        $this->resultat["location_velo_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
    public function location_verifidentite_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_verifidentite_select.sql";
        $this->resultat["location_verifidentite_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
	public function location_accessoire_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_accessoire_select.sql";
        $this->resultat["location_accessoire_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
	public function location_contrat_accessoire_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_contrat_accessoire_select.sql";
        $this->resultat["location_contrat_accessoire_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
	public function location_retour_accessoire_liste() {
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_retour_accessoire_select.sql";
        $this->resultat["location_retour_accessoire_liste"]= $this->oBdd->getSelectDatas($spathSQL, array("id_contrat"=>$this->VARS_HTML["id_contrat"]));

	}
	public function location_gestion_accessoire_liste() {
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_gestion_accessoire_select.sql";
        $this->resultat["location_gestion_accessoire_liste"]= $this->oBdd->getSelectDatas($spathSQL, array("id_contrat"=>$this->VARS_HTML["id_contrat"]));

	}
	public function location_utilisateur_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_utilisateur_select.sql";
        $this->resultat["location_utilisateur_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
	public function location_ville_liste()	{
        $spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_ville_select.sql";
        $this->resultat["location_ville_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
    }
	public function location_type_utilisateur_liste() {
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_type_utilisateur_select.sql";
        $this->resultat["location_type_utilisateur_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}
	/**
     * 
	 * Method location_contrat_save ()
	 *
	 * Insert a new location_contrat in database
	 */
	public function location_contrat_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_select_max_num_contrat.sql";
        $res= $this->oBdd->getSelectDatas($spathSQL, array());
		$num_contrat= $res[0]["num_contrat"];

		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_contrat_insert.sql";
		$this->resultat["location_contrat_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_velo" => $this->VARS_HTML["id_velo"], 
																	"id_type_identite" => $this->VARS_HTML["id_type_identite"], 
																	"id_utilisateur" => $this->VARS_HTML["id_utilisateur"],
																	"datedebut_loc_contrat" => $this->VARS_HTML["datedebut_loc_contrat"],
																	"numeroidentite_contrat" => $this->VARS_HTML["numeroidentite_contrat"],
																	"num_contrat" => $num_contrat,
																	"datefin_loc_contrat" => $this->VARS_HTML["datefin_loc_contrat"],
																	"commentaire_contrat" => $this->VARS_HTML["commentaire_contrat"]
																	));
		$this->resultat["id_contrat_created"]= $this->oBdd->getLastInsertId();

		$aOfAccessoires= explode("|", $this->VARS_HTML["sListeAccessoires"]);

		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_contrat_accessoire_insert.sql";
		for ($i=0; $i<count($aOfAccessoires); $i++)	{
			$this->resultat["location_contrat_save"]= $this->oBdd->treatDatas($spathSQL, array(
				"id_contrat" => $this->resultat["id_contrat_created"], 
				"id_accessoire" => $aOfAccessoires[$i],
			));
		}
	}


	/**
	 * Method supprime_location_gestion()
	 *
	 * Delete a user in database
	 */
	public function location_gestion_delete(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_gestion_delete.sql";
		$this->resultat["location_gestion_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_contrat" => $this->VARS_HTML["id_contrat"]
																	));
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_gestion_accessoire_delete.sql";
		$this->resultat["location_gestion_delete"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_contrat" => $this->VARS_HTML["id_contrat"]
																	));

	}
	// }

	/**
	 * Method update_contrat()
	 *
	 * Update the contrat with param id_contrat in database
	 */
	public function location_retour_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_retour_update.sql";
		$this->resultat["location_retour_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_contrat" => $this->VARS_HTML["id_contrat"],   
																	"commentaire_contrat" => $this->VARS_HTML["commentaire_contrat"],
																	"datefin_loc_contrat" => $this->VARS_HTML["datefin_loc_contrat"],
																	"retenue_caution" => $this->VARS_HTML["retenue_caution"],
																	"actif_contrat" => $this->VARS_HTML["actif_contrat"]
																	));
		if ($this->resultat["location_retour_update"] != "") {
			$this->resultat["error"]= 1;
		}  else  {
			$this->resultat["error"]= "";
		}

	}

	public function location_gestion_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_gestion_update.sql";
		$this->resultat["location_gestion_update"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_contrat" => $this->VARS_HTML["id_contrat"], 
																	"id_utilisateur" => $this->VARS_HTML["id_utilisateur"], 
																	"id_velo" => $this->VARS_HTML["id_velo"], 
																	"commentaire_contrat" => $this->VARS_HTML["commentaire_contrat"],
																	"datedebut_loc_contrat" => $this->VARS_HTML["datedebut_loc_contrat"], 
																	"datefin_loc_contrat" => $this->VARS_HTML["datefin_loc_contrat"],
																	"id_type_identite" => $this->VARS_HTML["id_type_identite"],
																	"numeroidentite_contrat" => $this->VARS_HTML["numeroidentite_contrat"],
																	"retenue_caution" => $this->VARS_HTML["retenue_caution"],
																	"actif_contrat" => $this->VARS_HTML["actif_contrat"]
																	));
		if ($this->resultat["location_gestion_update"] != "") {
			$this->resultat["error"]= 1;
		}  else  {
			$this->resultat["error"]= "";
		}
		$aOfAccessoires= explode("|", $this->VARS_HTML["sListeAccessoires"]);

		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "location_gestion_accessoire_update.sql";
		for ($i=0; $i<count($aOfAccessoires); $i++)	{
			$this->resultat["location_gestion_update"]= $this->oBdd->treatDatas($spathSQL, array(
				"id_contrat" => $this->VARS_HTML["id_contrat"], 
				"id_accessoire" => $aOfAccessoires[$i],
			));
		}

	}

}
?>
