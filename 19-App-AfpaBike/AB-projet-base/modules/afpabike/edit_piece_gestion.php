<?php
require_once "piece_gestion_service.php";

/**
 * Class Edit_piece_gestion | file edit_piece_gestion.php
 *
 * In this class, we show the interface "edit_piece_gestion.html".
 * With this interface, we'll be able to edit a movie with its id
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Edit_piece_gestion	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;

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
	 * Get datas from database and edit a movie with its id
	 */
	function main()	{
		$objet_edit_piece_gestion = new piece_gestion_service();
		$objet_edit_piece_gestion -> edit_piece_gestion();

		$this->resultat = $objet_edit_piece_gestion->resultat;
	}
}

?>
