<?php
require_once "marque_service.php";

/**
 * Class marque_liste | file marque_liste.php
 *
 * In this class, we show the interface "marque_liste.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "marque_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage marque_liste
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Marque_liste	{
	
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
		$obj_marque= new Marque_service();
		$obj_marque->marque_liste();
		
		// Get elements for the view
		$this->resultat= $obj_marque->resultat;
		$this->VARS_HTML= $obj_marque->VARS_HTML;

		// kill object
		unset($obj_marque);
	}
}

?>
