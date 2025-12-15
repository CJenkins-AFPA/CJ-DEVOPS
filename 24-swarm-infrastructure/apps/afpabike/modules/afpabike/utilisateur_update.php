<?php
require_once "utilisateur_service.php";

/**
 * Class Utilisateur_update | file Utilisateur_update.php
 *
 * In this class, we show the interface "Utilisateur_update.html".
 * With this interface, we'll be able to update a user with its id
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Utilisateur_update	{
	
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
	 * Update a user with its id
	 */
	function main()	{
		$objet_utilisateur_update = new Utilisateur_service();
		$objet_utilisateur_update->utilisateur_update();

		$this->resultat= $objet_utilisateur_update->resultat;
		$this->VARS_HTML= $objet_utilisateur_update->VARS_HTML;
	}
}
?>
