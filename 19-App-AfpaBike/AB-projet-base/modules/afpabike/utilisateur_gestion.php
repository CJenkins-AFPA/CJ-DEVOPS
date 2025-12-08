<?php
/**
 * Class utilisateur_gestion | file utilisateur_gestion.php
 *
 * In this class, we show the interface "utilisateur_gestion.html".
 * With this interface, we'll be able to add a new user
 *
 * @package Afpa Bike Project
 * @subpackage utilisateur_gestion
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Utilisateur_gestion	{
	
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
	 * Get interface to add
	 */
	function main()	{
		$this->VARS_HTML["page"]= "utilisateur_gestion";
	}
}

?>
