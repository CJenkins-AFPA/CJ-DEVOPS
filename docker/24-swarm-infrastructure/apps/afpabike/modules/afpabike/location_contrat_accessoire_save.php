<?php
require_once "location_service.php";

/**
 * Class location_contrat_accessoire_save | file location_contrat_accessoire_save.php
 *
 * In this class, we show the interface "location_contrat_accessoire_save.html".
 * With this interface, we'll be able to save a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_contrat_accessoire_save	{
	
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
	 * Add a location_contrat_accessoire in the database
	 */
	function main()	{
		// Create a new location_contrat_accessoire
		$obj_location_contrat_accessoire_save = new Location_service();
		$obj_location_contrat_accessoire_save->location_contrat_accessoire_save();

		$this->resultat= $obj_location_contrat_accessoire_save->resultat;
	}
}

?>
