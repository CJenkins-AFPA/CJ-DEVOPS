<?php
require_once "database.php";
require_once "securite.php";
/**
 * Class Initialize | file Initialize.php
 *
 * In this class, we are initializing class of database and security.
 *
 * List of classes needed for this class
 *
 * require_once "database.php";
 * require_once "securite.php";
 *
 * @package Cinema Project
 * @subpackage Initialize
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */

Class Initialize	{
	/**
	 * protected $oBdd is used to store Database instance object
	 * @var object
	 */
	protected $oBdd;
	/**
	 * protected $GLOBALS_INI is used to store all globals in config file
	 * @var array
	 */
	protected $GLOBALS_INI;
	/**
	 * private $oForms is used to store Form Securite instance object
	 * @var object
	 */
	private $oForms;
	/**
	 * public $VARS_HTML is used to store all datas POST and GET
	 * @var array
	 */
	public $VARS_HTML;
	
	/**
	 * Get config globals
	 *
	 * Connect to the database
	 *
	 * Get datas POST and GET into VARS_HTML
	 *
	 */
	public function __construct()	{
		// Instance of Config
		$this->GLOBALS_INI= Configuration::getGlobalsINI();

		// Instance of BDD
		$this->oBdd = new Database($this->GLOBALS_INI["DB_HOST"],
								   $this->GLOBALS_INI["DB_NAME"],
								   $this->GLOBALS_INI["DB_LOGIN"],
								   $this->GLOBALS_INI["DB_PSW"]);

		// Instance of Securite to have $this->VARS_HTML
		$this->oForms= new Securite();
		$this->VARS_HTML= $this->oForms->VARS_HTML;
	}

	/**
	 * destroy Instance of Form
	 *
	 * disconnect of BDD
	 *
	 * destroy Instance of BDD
	 *
	 */
	public function __destruct()	{
		// destroy Instance of Form
		unset($this->oForms);
		// disconnect of BDD
		// destroy Instance of BDD
		unset($this->oBdd);
	}

}

?>
