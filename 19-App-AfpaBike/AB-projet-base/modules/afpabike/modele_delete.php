<?php
require_once "modele_service.php";

/**
 * Class modele_delete | file modele_delete.php
 *
 * In this class, we show the interface "modele_delete.html".
 * With this interface, we'll be able to delete a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Modele_delete	{
	
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
	 * Add a modele in the database
	 */
	function main()	{
		// Create a new modele
		$obj_modele_delete = new Modele_service();
		$obj_modele_delete->modele_delete();

		$this->resultat= $obj_modele_delete->resultat;
		$this->VARS_HTML["page"]= "modele_delete";
	}
}

?>
