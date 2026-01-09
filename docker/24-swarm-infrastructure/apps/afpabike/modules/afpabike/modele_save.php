<?php
require_once "modele_service.php";

/**
 * Class modele_save | file modele_save.php
 *
 * In this class, we show the interface "modele_save.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "modele_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage modele_save
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Modele_save	{
	
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
		$obj_modele->modele_save();
		
		// Get elements for the view
		$this->resultat= $obj_modele->resultat;
		$this->VARS_HTML= $obj_modele->VARS_HTML;

		// kill object
		unset($obj_modele);
		$this->VARS_HTML["page"]= "modele_save";
	}
}

?>
