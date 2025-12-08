<?php
require_once "location_service.php";

/**
 * Class location_delete | file location_delete.php
 *
 * In this class, we show the interface "location_delete.html".
 * With this interface, we'll be able to delete a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_gestion_delete	{
	
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
	 * Add a location in the database
	 */
	function main()	{
		// Create a new location
		$obj_location_delete = new Location_service();
		$obj_location_delete->location_gestion_delete();

		$this->resultat= $obj_location_delete->resultat;
		$this->VARS_HTML["page"]= "location_gestion_delete";
	}
}

?>
