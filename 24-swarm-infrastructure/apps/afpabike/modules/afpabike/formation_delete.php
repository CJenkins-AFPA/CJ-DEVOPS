<?php
require_once "formation_service.php";

/**
 * Class formation_delete | file formation_delete.php
 *
 * In this class, we show the interface "formation_delete.html".
 * With this interface, we'll be able to delete a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Formation_delete	{
	
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
		$obj_formation_delete = new Formation_service();
		$obj_formation_delete->formation_delete();

		$this->resultat= $obj_formation_delete->resultat;
		$this->VARS_HTML["page"]= "formation_delete";
	}
}

?>
