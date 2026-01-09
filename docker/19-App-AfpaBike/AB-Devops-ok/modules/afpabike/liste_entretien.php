<?php
require_once "entretien_service.php";

/**
 * Class Liste_entretien | file liste_entretien.php
 *
 * In this class, we show the interface "liste_entretien.html".
 * With this interface, we'll be able to list all the entretiens stored in database
 *
 * List of classes needed for this class
 *
 * require_once "entretien_service.php";
 *
 * @package AfpaBike Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Liste_entretien	{
	
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
		$obj_liste_entretien= new Entretien_service();
		$obj_liste_entretien->liste_entretien();
		
		// Get elements for the view
		$this->resultat= $obj_liste_entretien->resultat;
		$this->VARS_HTML= $obj_liste_entretien->VARS_HTML;
		
		// kill object
		unset($obj_liste_entretien);
	}
}

?>
