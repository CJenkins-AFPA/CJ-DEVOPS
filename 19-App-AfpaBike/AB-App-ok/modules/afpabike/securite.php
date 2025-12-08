<?php
/**
 * Class securite | file securite.php
 *
 * In this class, we are setting the security for all the project.
 *
 * @package Cinema Project
 * @subpackage securite
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
class securite {

	/**
	 * public $VARS_HTML is used to store all datas POST and GET
	 * @var array
	 */
	public $VARS_HTML;
	
	/**
	 * Parse all variables POST and add them into array VARS_HTML
	 *
	 * Parse all variables GET and add them into array VARS_HTML
	 *
	 * Add a default page in case of no page
	 *
	 */
	function __construct()	{
		// put all variables $_POST et $_GET into the array $VARS_HTML
		$this->VARS_HTML= [];

		foreach($_POST as $key => $val)	{
			$this->VARS_HTML[$key]= htmlspecialchars($val, ENT_QUOTES);
		}

		foreach($_GET as $key => $val)	{
			$this->VARS_HTML[$key]= htmlspecialchars($val, ENT_QUOTES);
		}

		if ( (!(isset($this->VARS_HTML["page"]))) || ($this->VARS_HTML["page"] == "") )	{
			$this->VARS_HTML["page"]= "connection";
		}
	}
}
?>