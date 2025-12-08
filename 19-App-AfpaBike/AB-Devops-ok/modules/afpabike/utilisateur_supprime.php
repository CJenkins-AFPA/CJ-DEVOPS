<?php
require_once "utilisateur_service.php";

/**
 * Class Utilisateur_supprime | file Utilisateur_supprime.php
 *
 * In this class, we show the interface "Utilisateur_supprime.html".
 * With this interface, we'll be able to delete a user with its id
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright 1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Utilisateur_supprime	{
	
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
	 * delete a user in the database with its id
	 */
	function main()	{
		$objet_utilisateur_supprime = new Utilisateur_service();
		$objet_utilisateur_supprime->utilisateur_supprime();

		$this->resultat= $objet_utilisateur_supprime->resultat;
		$this->VARS_HTML= $objet_utilisateur_supprime->VARS_HTML;
	}
}
?>
