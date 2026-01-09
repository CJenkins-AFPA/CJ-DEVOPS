<?php
require_once "type_velo_service.php";

/**
 * Class type_velo_update | file type_velo_update.php
 *
 * In this class, we show the interface "type_velo_update.html".
 * With this interface, we'll be able to update a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_velo_update	{
	
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
	 * Add a type_velo in the database
	 */
	function main()	{
		// Create a new type_velo
		$obj_type_velo_update = new Type_velo_service();
		$obj_type_velo_update->type_velo_update();

		$this->resultat= $obj_type_velo_update->resultat;
		$this->VARS_HTML["page"]= "type_velo_update";
	}
}

?>
