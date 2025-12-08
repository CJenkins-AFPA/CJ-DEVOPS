<?php
require_once "utilisateur_service.php";

/**
 * Class Utilisateur_save | file Utilisateur_save.php
 *
 * In this class, we show the interface "Utilisateur_save.html".
 * With this interface, we'll be able to save a new user
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Utilisateur_save	{
	
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
	 * Add a utilisateur in the database
	 */
	function main()	{
		// Create a new utilisateur
		$obj_utilisateur_save = new Utilisateur_service();
		$obj_utilisateur_save->utilisateur_save();

		$this->resultat= $obj_utilisateur_save->resultat;
	}
}

?>
