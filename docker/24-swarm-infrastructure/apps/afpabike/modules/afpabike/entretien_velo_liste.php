<?php
require_once "entretien_service.php";
/**
 * Class entretien_velo | file entretien_velo.php
 *
 * In this class, we show the interface "entretien_velo.html".
 * With this interface, we'll be able to add a new movie
 *
 * @package Afpa Bike Project
 * @subpackage entretien_velo
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Entretien_velo_liste	{
	
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
	 * Get list of all clients
	 */
	function main()	{
		// List 'em all !!
		$obj_entretien_velo= new Entretien_service();
		$obj_entretien_velo->entretien_velo_liste();
		
		// Get elements for the view
		$this->resultat= $obj_entretien_velo->resultat;
		$this->VARS_HTML= $obj_entretien_velo->VARS_HTML;
		
		// kill object
		unset($obj_entretien_velo);
	}
}

?>
