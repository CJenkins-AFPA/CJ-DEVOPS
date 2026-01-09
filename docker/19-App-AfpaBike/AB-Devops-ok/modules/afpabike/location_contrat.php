<?php
require_once "location_service.php";
/**
 * Class location_contrat | file location_contrat.php
 *
 * In this class, we show the interface "location_contrat.html".
 * With this interface, we'll be able to add a new contrat
 *
 * @package Afpa Bike Project
 * @subpackage location_contrat
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Location_contrat	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
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
	 * Get interface to add
	 */
	function main()	{
		$this->VARS_HTML["page"]= "location_contrat";
	}
}

?>
