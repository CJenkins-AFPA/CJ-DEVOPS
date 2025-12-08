<?php
require_once "caution_service.php";

/**
 * Class caution_save | file caution_save.php
 *
 * In this class, we show the interface "caution_save.html".
 * With this interface, we'll be able to save a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Caution_save	{
	
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
	 * Add a caution in the database
	 */
	function main()	{
		// Create a new caution
		$obj_caution_save = new Caution_service();
		$obj_caution_save->caution_save();

		$this->resultat= $obj_caution_save->resultat;
		$this->VARS_HTML["page"]= "caution_save";
	}
}

?>
