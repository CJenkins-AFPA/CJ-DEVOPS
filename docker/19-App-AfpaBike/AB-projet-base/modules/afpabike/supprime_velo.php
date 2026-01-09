<?php
require_once "velo_service.php";

/**
 * Class Supprime_velo | file Supprime_velo.php
 *
 * In this class, we show the interface "Supprime_velo.html".
 * With this interface, we'll be able to delete a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Supprime_velo	{
	
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
	 * delete a movie in the database with its id
	 */
	function main()	{
		$objet_supprime_velo = new Velo_service();
		$objet_supprime_velo->supprime_velo();

		$this->resultat= $objet_supprime_velo->resultat;
		$this->VARS_HTML= $objet_supprime_velo->VARS_HTML;
	}
}
?>
