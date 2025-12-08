<?php
require_once "type_rep_service.php";

/**
 * Class type_rep_liste | file type_rep_liste.php
 *
 * In this class, we show the interface "type_rep_liste.html".
 * With this interface, we'll be able to list all the bikes stored in database
 *
 * List of classes needed for this class
 *
 * require_once "type_rep_service.php";
 *
 * @package Afpa Bike Project
 * @subpackage type_rep_liste
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Type_rep_liste	{
	
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
		$obj_type_rep= new Type_rep_service();
		$obj_type_rep->type_rep_liste();
		
		// Get elements for the view
		$this->resultat= $obj_type_rep->resultat;
		$this->VARS_HTML= $obj_type_rep->VARS_HTML;

		// kill object
		unset($obj_type_rep);
	}
}

?>
