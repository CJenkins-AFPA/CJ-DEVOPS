<?php
require_once "piece_gestion_service.php";

/**
 * Class Supprime_piece_gestion | file Supprime_piece_gestion.php
 *
 * In this class, we show the interface "Supprime_piece_gestion.html".
 * With this interface, we'll be able to delete a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Supprime_piece_gestion	{
	
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
		$objet_supprime_piece_gestion = new Piece_gestion_service();
		$objet_supprime_piece_gestion->supprime_piece_gestion();

		$this->resultat= $objet_supprime_piece_gestion->resultat;
		$this->VARS_HTML= $objet_supprime_piece_gestion->VARS_HTML;
	}
}
?>
