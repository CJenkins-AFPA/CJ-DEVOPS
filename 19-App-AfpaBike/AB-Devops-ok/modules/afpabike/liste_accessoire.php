<?php
require_once "accessoire_service.php";

/**
 * Class Liste_accessoire | file liste_accessoire.php
 *
 * In this class, we show the interface "liste_film.html".
 * With this interface, we'll be able to list all the films stored in database
 *
 * List of classes needed for this class
 *
 * require_once "film_service.php";
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Liste_accessoire	{
	
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
	 * Get list of all movies
	 */
	function main()	{
		// List 'em all !!
		$obj_liste_accessoire= new Accessoire_service();
		$obj_liste_accessoire->liste_accessoire();
		
		// Get elements for the view
		$this->resultat= $obj_liste_accessoire->resultat;
		$this->VARS_HTML= $obj_liste_accessoire->VARS_HTML;
		
		// kill object
		unset($obj_liste_accessoire);
	}
}

?>
