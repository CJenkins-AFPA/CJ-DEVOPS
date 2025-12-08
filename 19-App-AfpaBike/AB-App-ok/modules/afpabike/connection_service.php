<?php
require_once "initialize.php";

/**
 * Class Connection_service | file Connection_service.php
 *
 * In this class, we have methods for :
 * - adding connection with method save_connection()
 * - updating connection with method update_connection()
 * - deleting connection with method supprime_connection()
 * - listing connection with method liste_connection()
 * - editing connection with method edit_connection()
 * With this interface, we'll be able to list all the connections stored in database
 *
 * List of classes needed for this class
 *
 * require_once "Connection_service.php";
 *
 * @package AFPA Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Connection_service extends Initialize	{
	
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
	 * Method edit_client()
	 *
	 * Edit the client with param id_client from the database
	 */
	public function connection_utilisateur(){
		// Here I can Access to :
		// $this->GLOBALS_INI
		// $this->oBdd
		// $this->VARS_HTML
		$spathSQL= $this->GLOBALS_INI["PATH_HOME"] . $this->GLOBALS_INI["PATH_SQL"] . "select_connection_login.sql";
		$this->resultat["connection_login"]= $this->oBdd->getSelectDatas($spathSQL, 
			array( 
				"login_utilisateur" => $this->VARS_HTML["username"], 
				"mdp_utilisateur" => $this->crypterssl($this->VARS_HTML["new-password"])
			)
		);
	}

	/**
	 * Method crypterssl()
	 *
	 * Crypt the password of the user
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
