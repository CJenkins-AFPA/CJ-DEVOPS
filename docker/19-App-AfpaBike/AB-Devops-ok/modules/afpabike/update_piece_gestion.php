<?php
require_once "piece_gestion_service.php";

/**
 * Class Update_piece_gestion | file Update_piece_gestion.php
 *
 * In this class, we show the interface "Update_piece_gestion.html".
 * With this interface, we'll be able to update a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Update_piece_gestion	{
	
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
		$objet_update_piece_gestion = new Piece_gestion_service();
		$objet_update_piece_gestion->update_piece_gestion();

		$this->resultat= $objet_update_piece_gestion->resultat;
		$this->VARS_HTML= $objet_update_piece_gestion->VARS_HTML;
	}
}
?>
