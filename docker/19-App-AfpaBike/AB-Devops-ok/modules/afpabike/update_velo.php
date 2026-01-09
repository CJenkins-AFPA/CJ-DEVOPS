<?php
require_once "velo_service.php";

/**
 * Class Update_velo | file Update_velo.php
 *
 * In this class, we show the interface "Update_velo.html".
 * With this interface, we'll be able to update a user with its id
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Update_velo	{
	
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
	 * Update a user with its id
	 */
	function main()	{
		$objet_update_velo = new Velo_service();
		$objet_update_velo->update_velo();

		$this->resultat= $objet_update_velo->resultat;
		$this->VARS_HTML= $objet_update_velo->VARS_HTML;
	}
}
?>
