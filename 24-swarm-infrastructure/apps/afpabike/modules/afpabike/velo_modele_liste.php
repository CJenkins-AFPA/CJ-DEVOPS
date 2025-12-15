<?php
require_once "velo_service.php";

/**
 * Class velo_modele_liste | file velo_modele_liste.php
 *
 * In this class, we show the interface "velo_modele_liste.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "velo_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage velo_modele_liste
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Velo_modele_liste	{
	
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
		$obj_velo= new Velo_service();
		$obj_velo->velo_modele_liste();
		
		// Get elements for the view
		$this->resultat= $obj_velo->resultat;
		$this->VARS_HTML= $obj_velo->VARS_HTML;
		
		$this->VARS_HTML["page"]= "velo_modele_liste";

		// kill object
		unset($obj_velo);
	}
}

?>
