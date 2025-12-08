<?php
require_once "initialize.php";

/**
 * Class Signature_service | file Signature_service.php
 *
 * In this class, we have methods for :
 * - adding a movie with method save_film()
 * - updating a movie with method update_film()
 * - deleting a movie with method supprime_film()
 * - listing all movies with method liste_film()
 * - editing a movie with method edit_film()
 * With this interface, we'll be able to list all the films stored in database
 *
 * List of classes needed for this class
 *
 * require_once "Signature_service.php";
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class Accessoire_service extends Initialize	{
	
	/**
	 * public $resultat is used to store all datas needed for HTML Templates
	 * @var array
	 */
	public $resultat;
	public $VARS_HTML;

	/**
	 * Call the parent constructor
	 *
	 * init variables resultat
	 */
	public function __construct()	{
		// Call Parent Constructor
		parent::__construct();

		// init variables resultat
		$this->resultat= [];
	}

	/**
	 * Call the parent destructor
	 */
	public function __destruct()	{
		// Call Parent destructor
		parent::__destruct();
	}

}

?>
                                                                   