<?php
require_once "accessoire_service.php";

/**
 * Class Supprime_accessoire | file Supprime_accessoire.php
 *
 * In this class, we show the interface "Supprime_film.html".
 * With this interface, we'll be able to delete a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Supprime_accessoire	{
	
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
		$objet_supprime_accessoire = new Accessoire_service();
		$objet_supprime_accessoire->supprime_accessoire();

		$this->resultat= $objet_supprime_accessoire->resultat;
		$this->VARS_HTML= $objet_supprime_accessoire->VARS_HTML;
	}
}
?>
