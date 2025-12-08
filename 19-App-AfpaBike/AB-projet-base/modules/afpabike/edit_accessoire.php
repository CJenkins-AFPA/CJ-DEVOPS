<?php
require_once "Accessoire_service.php";

/**
 * Class Edit_film | file edit_film.php
 *
 * In this class, we show the interface "edit_film.html".
 * With this interface, we'll be able to edit a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Edit_accessoire	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
 	public $VARS_HTML;
	/**
	 * init variables resultatS
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
		$objet_edit_accessoire= new Accessoire_service();
		$objet_edit_accessoire -> edit_accessoire();

		$this->resultat = $objet_edit_accessoire->resultat;
	}
}

?>
