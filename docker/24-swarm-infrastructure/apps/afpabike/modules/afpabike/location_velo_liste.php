<?php
require_once "location_service.php";
/**
 * Class location_velo | file location_velo.php
 *
 * In this class, we show the interface "location_velo.html".
 * With this interface, we'll be able to add a new movie
 *
 * @package Afpa Bike Project
 * @subpackage location_velo
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_velo_liste	{
	
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
	 * Get list of all clients
	 */
	function main()	{
		// List 'em all !!
		$obj_location_velo= new Location_service();
		$obj_location_velo->location_velo_liste();
		
		// Get elements for the view
		$this->resultat= $obj_location_velo->resultat;
		$this->VARS_HTML= $obj_location_velo->VARS_HTML;
		
		// kill object
		unset($obj_location_velo);
	}
}

?>
