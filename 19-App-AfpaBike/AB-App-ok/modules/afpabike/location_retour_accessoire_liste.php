<?php
require_once "location_service.php";
/**
 * Class location_retour_accessoire | file location_retour_accessoire.php
 *
 * In this class, we show the interface "location_retour_accessoire.html".
 * With this interface, we'll be able to add a new movie
 *
 * @package Afpa Bike Project
 * @subpackage location_retour_accessoire
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_retour_accessoire_liste	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
    /** 
    * public $VARS_HTML is used to store all datas needed POST or GET
    * @var array
    */
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
	 * Get list of all accessoires 
	 */
	function main()	{
		// List 'em all !!
		$obj_location_retour_accessoire= new Location_service();
		$obj_location_retour_accessoire->location_retour_accessoire_liste();
		
		// Get elements for the view
		$this->resultat= $obj_location_retour_accessoire->resultat;
		$this->VARS_HTML= $obj_location_retour_accessoire->VARS_HTML;
		
		// kill object
		unset($obj_location_retour_accessoire);
	}
}

?>
