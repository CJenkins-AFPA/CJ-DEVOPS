<?php
/**
 * Class entretien_gestion | file entretien_gestion.php
 *
 * In this class, we show the interface "entretien_gestion.html".
 * With this interface, we'll be able to add a new movie
 *
 * @package Afpa Bike Project
 * @subpackage entretien_gestion
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Entretien_gestion	{
	
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
		$this->VARS_HTML["page"]= "entretien_gestion";
	}
	
}

?>
