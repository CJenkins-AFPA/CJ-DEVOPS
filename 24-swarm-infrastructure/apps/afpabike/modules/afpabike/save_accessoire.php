<?php
require_once "accessoire_service.php";

/**
 * Class Save_accessoire | file Save_accessoire.php
 *
 * In this class, we show the interface "Save_accessoire.html".
 * With this interface, we'll be able to save a new movie
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Save_accessoire	{
	
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
	 * Add a movie in the database
	 */
	function main()	{
		// Create a new accessoire
		$obj_save_accessoire = new Accessoire_service();
		$obj_save_accessoire->save_accessoire();

		$this->resultat= $obj_save_accessoire->resultat;
		$this->VARS_HTML= $obj_save_accessoire->VARS_HTML;
	}
}

?>
