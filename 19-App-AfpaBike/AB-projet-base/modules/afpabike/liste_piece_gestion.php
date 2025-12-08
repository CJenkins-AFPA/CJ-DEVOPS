<?php
require_once "piece_gestion_service.php";

/**
 * Class Liste_piece_gestion | file liste_piece_gestion.php
 *
 * In this class, we show the interface "liste_piece_gestion.html".
 * With this interface, we'll be able to list all the piece_gestions stored in database
 *
 * List of classes needed for this class
 *
 * require_once "piece_gestion_service.php";
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Liste_piece_gestion	{
	
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
		$obj_liste_piece_gestion= new Piece_gestion_service();
		$obj_liste_piece_gestion->liste_piece_gestion();
		
		// Get elements for the view
		$this->resultat= $obj_liste_piece_gestion->resultat;
		$this->VARS_HTML= $obj_liste_piece_gestion->VARS_HTML;
		$this->VARS_HTML["page"]= "liste_piece_gestion";
		
		// kill object
		unset($obj_liste_piece_gestion);
	}
}

?>
