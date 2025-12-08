<?php
require_once "utilisateur_service.php";

/**
 * Class Utilisateur_liste | file Utilisateur_liste.php
 *
 * In this class, we show the interface "Utilisateur_liste.html".
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
class Utilisateur_liste	{
	
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
	 * Get list of all users
	 */
	function main()	{
		// List 'em all !!
		$obj_utilisateur_liste= new Utilisateur_service();
		$obj_utilisateur_liste->utilisateur_liste();
		
		// Get elements for the view
		$this->resultat= $obj_utilisateur_liste->resultat;
		$this->VARS_HTML= $obj_utilisateur_liste->VARS_HTML;
		
		// kill object
		unset($obj_utilisateur_liste);
	}
}

?>
