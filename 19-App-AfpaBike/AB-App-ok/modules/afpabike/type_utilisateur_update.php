<?php
require_once "type_utilisateur_service.php";

/**
 * Class type_utilisateur_update | file type_utilisateur_update.php
 *
 * In this class, we show the interface "type_utilisateur_update.html".
 * With this interface, we'll be able to update a new movie
 *
 * @package AFPA Bike
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_utilisateur_update	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
	/**
    * public $VARS_HTML is used to store all datas needed POST or GET
    * @var array
    */
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
	 * Add a type_utilisateur in the database
	 */
	function main()	{
		// Create a new type_utilisateur
		$obj_type_utilisateur_update = new Type_utilisateur_service();
		$obj_type_utilisateur_update->type_utilisateur_update();

		$this->resultat= $obj_type_utilisateur_update->resultat;
		$this->VARS_HTML["page"]= "type_utilisateur_update";
	}
}

?>
