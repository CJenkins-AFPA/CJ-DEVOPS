<?php
require_once "formation_service.php";

/**
 * Class formation_liste | file formation_liste.php
 *
 * In this class, we show the interface "formation_liste.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "formation_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage formation_liste
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Formation_liste	{
	
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
		$obj_formation= new Formation_service();
		$obj_formation->formation_liste();
		
		// Get elements for the view
		$this->resultat= $obj_formation->resultat;
		$this->VARS_HTML= $obj_formation->VARS_HTML;

		// kill object
		unset($obj_formation);
	}
}

?>
