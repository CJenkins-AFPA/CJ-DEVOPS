<?php
require_once "piece_gestion_service.php";

/**
 * Class Save_piece_gestion | file Save_piece_gestion.php
 *
 * In this class, we show the interface "Save_piece_gestion.html".
 * With this interface, we'll be able to save a new movie
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Save_piece_gestion	{
	
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
		// Create a new piece_gestion
		$obj_save_piece_gestion = new Piece_gestion_service();
		$obj_save_piece_gestion->save_piece_gestion();

		$this->resultat= $obj_save_piece_gestion->resultat;
		$this->VARS_HTML= $obj_save_piece_gestion->VARS_HTML;
	}
}

?>
