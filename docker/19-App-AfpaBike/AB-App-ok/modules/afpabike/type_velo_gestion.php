<?php
/**
 * Class type_velo_gestion | file type_velo_gestion.php
 *
 * In this class, we show the interface "type_velo_gestion.html".
 * With this interface, we'll be able to add a new movie
 *
 * @package Afpa Bike Project
 * @subpackage type_velo_gestion
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_velo_gestion	{
	
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
		$this->VARS_HTML["page"]= "type_velo_gestion";
	}
	
}

?>
