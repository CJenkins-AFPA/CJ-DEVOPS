<?php
require_once "modele_service.php";

/**
 * Class modele_type_velo_liste | file modele_type_velo_liste.php
 *
 * In this class, we show the interface "modele_type_velo_liste.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "modele_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage modele_type_velo_liste
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Modele_type_velo_liste	{
	
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
		$obj_modele= new Modele_service();
		$obj_modele->modele_type_velo_liste();
		
		// Get elements for the view
		$this->resultat= $obj_modele->resultat;
		$this->VARS_HTML= $obj_modele->VARS_HTML;

		// kill object
		unset($obj_modele);
	}
}

?>
