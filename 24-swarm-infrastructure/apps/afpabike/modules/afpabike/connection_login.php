<?php
require_once "connection_service.php";
/**
 * Class Connection_login | file Connection_login.php
 *
 * In this class, we show the interface "Connection_login.html".
 * With this interface, we'll be able to add a new movie
 *
 * @package Afpa Bike Project
 * @subpackage Connection_login
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Connection_login	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
	public $VARS_HTML;

	/**
	 * init variables resultat
	 *
	 * execute main function
	 */
	public function __construct()	{
		// init variables resultat
		$this->resultat= [];

		// execute main function
		$this->main();
	}

	/**
	 * Get interface to add
	 */
	function main()	{
		$obj_connection = new Connection_service();
		$obj_connection->connection_utilisateur();

		if (count($obj_connection->resultat["connection_login"]) == 0)	{
			$this->VARS_HTML["page"]= "connection";
		}  else  {
			$_SESSION["id_utilisateur"]= $obj_connection->resultat["connection_login"][0]["id_utilisateur"];
			$_SESSION["id_utilisateur"]= $obj_connection->resultat["connection_login"][0]["id_type_utilisateur"];
			$_SESSION["id_utilisateur"]= $obj_connection->resultat["connection_login"][0]["nom_utilisateur"];
			$_SESSION["id_utilisateur"]= $obj_connection->resultat["connection_login"][0]["prenom_utilisateur"];
			$this->VARS_HTML["page"]= "accueil";
		}

	}
}

?>
