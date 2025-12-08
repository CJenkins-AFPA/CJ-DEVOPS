<?php
require_once "ville_service.php";

/**
 * Class ville_delete | file ville_delete.php
 *
 * In this class, we show the interface "ville_delete.html".
 * With this interface, we'll be able to delete a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Ville_delete	{
	
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
	 * Add a ville in the database
	 */
	function main()	{
		// Create a new ville
		$obj_ville_delete = new Ville_service();
		$obj_ville_delete->ville_delete();

		$this->resultat= $obj_ville_delete->resultat;
		$this->VARS_HTML["page"]= "ville_delete";
	}
}

?>
