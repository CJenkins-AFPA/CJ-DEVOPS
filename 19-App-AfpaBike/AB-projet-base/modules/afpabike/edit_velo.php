<?php
require_once "velo_service.php";

/**
 * Class Edit_velo | file edit_velo.php
 *
 * In this class, we show the interface "edit_velo.html".
 * With this interface, we'll be able to edit a movie with its id
 *
 * @package Afpa Bike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Edit_velo	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;

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
	 * Get datas from database and edit a movie with its id
	 */
	function main()	{
		$objet_edit_velo = new Velo_service();
		$objet_edit_velo -> edit_velo();

		$this->resultat = $objet_edit_velo->resultat;
	}
}

?>
