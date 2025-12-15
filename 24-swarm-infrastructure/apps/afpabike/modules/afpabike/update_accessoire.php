<?php
require_once "accessoire_service.php";

/**
 * Class Update_film | file Update_film.php
 *
 * In this class, we show the interface "Update_film.html".
 * With this interface, we'll be able to update a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Update_accessoire	{
	
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
	 * Update a movie with its id
	 */
	function main()	{
		$objet_update_accessoire = new Acessoire_service();
		$objet_update_accessoire->update_accessoire();

		$this->resultat= $objet_update_accessoire->resultat;
		$this->VARS_HTML= $objet_update_accessoire->VARS_HTML;
	}
}
?>
