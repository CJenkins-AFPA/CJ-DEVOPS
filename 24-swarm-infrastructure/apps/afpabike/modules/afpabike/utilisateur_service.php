<?php
require_once "initialize.php";

/**
 * Class utilisateur_service | file utilisateur_service.php
 *
 * In this class, we have methods for :
 * - adding a user with method save_utilisateur()
 * - updating a user with method utilisateur_update()
 * - deleting a user with method utilisateur_supprime()
 * - listing all users with method liste_utilisateur()
 * - editing a user with method edit_utilisateur()
 * With this interface, we'll be able to list all the utilisateurs stored in database
 *
 * List of classes needed for this class
 *
 * require_once "utilisateur_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Utilisateur_service extends Initialize	{
	
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
	 * Method utilisateur_liste()
	 *
	 * List all users in database
	 */
	public function utilisateur_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_utilisateur.sql";
		$this->resultat["utilisateur_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	public function type_utilisateur_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "type_utilisateur_select.sql";
		$this->resultat["type_utilisateur_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}

	public function ville_liste()	{
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "ville_select.sql";
		$this->resultat["ville_liste"]= $this->oBdd->getSelectDatas($spathSQL, array());
	}
	/**
	 * Method utilisateur_save()
	 *
	 * Insert a new user in database
	 */
	public function utilisateur_save()	{
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "insert_utilisateur.sql";
		$this->resultat["utilisateur_save"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_ville" => $this->VARS_HTML["id_ville"],
																	"id_formation" => $this->VARS_HTML["id_formation"],
																	"id_type_utilisateur" => $this->VARS_HTML["id_type_utilisateur"],
																	"nom_utilisateur" => $this->VARS_HTML["nom_utilisateur"], 
																	"prenom_utilisateur" => $this->VARS_HTML["prenom_utilisateur"], 
																	"login_utilisateur" => $this->VARS_HTML["login_utilisateur"],
																	"mdp_utilisateur" => $this->crypterssl($this->VARS_HTML["mdp_utilisateur"]),
																	"debutformation_utilisateur" => $this->VARS_HTML["debutformation_utilisateur"],
																	"finformation_utilisateur" => $this->VARS_HTML["finformation_utilisateur"],
																	"email_utilisateur" => $this->VARS_HTML["email_utilisateur"],
																	"tel_utilisateur" => $this->VARS_HTML["tel_utilisateur"],
																	"adresse_utilisateur" => $this->VARS_HTML["adresse_utilisateur"],
																	"codepostal_utilisateur" => $this->VARS_HTML["codepostal_utilisateur"],
																	"complementadresse_utilisateur" => $this->VARS_HTML["complementadresse_utilisateur"],
																	"dateinscription_utilisateur" => $this->VARS_HTML["dateinscription_utilisateur"],
																	));
		$this->resultat["id_utilisateur_created"]= $this->oBdd->getLastInsertId();
	}
	
	/**
	 * Method utilisateur_edit()
	 *
	 * Edit the user with param id_utilisateur from the database
	 */
	public function utilisateur_update(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "update_utilisateur.sql";
		$this->resultat["utilisateur_update"]= $this->oBdd->getSelectDatas($spathSQL, array( 
																				"id_utilisateur" => $this->VARS_HTML["id_utilisateur"]
																			));
		if ($this->resultat["utilisateur_update"] != "") {
			$this->resultat["error"]= 1;
		}  else  {
			$this->resultat["error"]= "";
		}
	}

	/**
	 * Method utilisateur_supprime()
	 *
	 * Delete a user in database
	 */
	public function utilisateur_supprime(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "delete_utilisateur.sql";
		$this->resultat["utilisateur_supprime"]= $this->oBdd->treatDatas($spathSQL, array(
																	"id_utilisateur" => $this->VARS_HTML["id_utilisateur"]
																	));
		if ($this->resultat["utilisateur_supprime"] != "") {
			$this->resultat["error"]= 1;
		}  else  {
			$this->resultat["error"]= "";
		}

	}


	/**
	 * Method utilisateur_update()
	 *
	 * Update the user with param id_utilisateur in database
	 */
	

	private function crypterssl($maChaineACrypter) {
		// Set a random salt
		// $salt = openssl_random_pseudo_bytes(8);
		// Or empty salt so that we'll be able to compare again
		$maCleDeCryptage= "afpa_bike_key";
		$salt= "";
		$salted = '';
		$dx = '';
		// Salt the key(32) and iv(16) = 48
		while (strlen($salted) < 48) {
		  $dx = md5($dx.$maCleDeCryptage.$salt, true);
		  $salted .= $dx;
		}
		$key = substr($salted, 0, 32);
		$iv  = substr($salted, 32,16);
		$encrypted_data = openssl_encrypt($maChaineACrypter, 'aes-256-cbc', $key, true, $iv);
		return base64_encode($salt . $encrypted_data);
	}
}


?>
