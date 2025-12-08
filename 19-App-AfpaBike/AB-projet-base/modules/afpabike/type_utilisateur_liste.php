<?php
require_once "type_utilisateur_service.php";

/**
 * Class type_utilisateur_liste | file type_utilisateur_liste.php
 *
 * In this class, we show the interface "type_utilisateur_liste.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "type_utilisateur_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage type_utilisateur_liste
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_utilisateur_liste	{
	
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
	 * Get list of all movies
	 */
	function main()	{
		// List 'em all !!
		$obj_type_utilisateur= new Type_utilisateur_service();
		$obj_type_utilisateur->type_utilisateur_liste();
		
		// Get elements for the view
		$this->resultat= $obj_type_utilisateur->resultat;
		$this->VARS_HTML= $obj_type_utilisateur->VARS_HTML;

		// kill object
		unset($obj_type_utilisateur);
	}
}

?>
