<?php
require_once "velo_service.php";

/**
 * Class Liste_velo | file liste_velo.php
 *
 * In this class, we show the interface "liste_velo.html".
 * With this interface, we'll be able to list all the velos stored in database
 *
 * List of classes needed for this class
 *
 * require_once "velo_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Liste_velo	{
	
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
		$obj_liste_velo= new Velo_service();
		$obj_liste_velo->liste_velo();
		
		// Get elements for the view
		$this->resultat= $obj_liste_velo->resultat;
		$this->VARS_HTML= $obj_liste_velo->VARS_HTML;
		
		// kill object
		unset($obj_liste_velo);
	}
}

?>
