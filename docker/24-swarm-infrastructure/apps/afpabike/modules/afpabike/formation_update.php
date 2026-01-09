<?php
require_once "formation_service.php";

/**
 * Class formation_update | file formation_update.php
 *
 * In this class, we show the interface "formation_update.html".
 * With this interface, we'll be able to update a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Formation_update	{
	
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
	 * Add a formation in the database
	 */
	function main()	{
		// Create a new formation
		$obj_formation_update = new Formation_service();
		$obj_formation_update->formation_update();

		$this->resultat= $obj_formation_update->resultat;
		$this->VARS_HTML["page"]= "formation_update";
	}
}

?>
