<?php
/**
 * Class Database | file Database.php
 *
 * In this class, we have all mysql methods :
 *
 * Connection to the database in the constructor
 *
 * Disconnection to the database in the destructor
 *
 * Getting the last insert id
 *
 * Execute select method
 *
 * Execute insert / update / delete method
 *
 * @package Cinema Project
 * @subpackage Database
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */

Class Database {
	
	/**
	 * private $_hDb is used to store Database instance object
	 * @var object
	 */
	private $_hDb;
	
	/**
	 * Connect to the database
	 *
	 */
	function __construct($host, $name, $login, $psw)	{
		// Connection to DB : SERVEUR / LOGIN / PASSWORD / NOM_BDD
		try {
			$this->_hDb= new PDO('mysql:host='.$host.';dbname='.$name.';charset=utf8', $login, $psw);
		}
		catch (PDOException $e) {
			error_log("PDOException Connection to DB = " . $e->getMessage());
		}
	}

	/**
	 * Disconnect from the database
	 *
	 */
	function __destruct()	{
		$this->_hDb= null;
	}
	
	/**
	 * Get the last id inserted
	 *
	 */
	public function getLastInsertId()	{
		return $this->_hDb->lastInsertId();
	}

	/**
	 * Execute select method
	 *
	 */
	function getSelectDatas($spathSQL, $data=array(), $bForJS=null)	{
		// content of SQL file
		$sql= file_get_contents($spathSQL);

		// replace variables @variable from sql by values of the same variables'name
		foreach ($data as $key => $value) {
			// security for SQL injection
			$value= str_replace("'", "__SIMPLEQUOT__", $value);
			$value= str_replace('"', '__DOUBLEQUOT__', $value);
			$value= str_replace(";", "__POINTVIRGULE__", $value);
			$sql = str_replace('@'.$key, $value, $sql);
			error_log("key = " . $key . " | " . "value= " . $value. " | " . "sql = " . $sql);
		}

		error_log("getSelectDatas = " . $sql);

		$resultat= [];
		$resultat["error"]= "";
		try {
			// Execute la requete
			$results_db= $this->_hDb->prepare($sql);
			$results_db->execute();
		}
		catch (PDOException $e) {
			$resultat["error"]= $e->getMessage();
			error_log("PDOException getSelectDatas = " . $resultat["error"]);
		}

		if ($resultat["error"] == "")	{
			$resultat= [];
			while ($ligne = $results_db->fetch()) {
				$new_ligne= [];
				foreach ($ligne as $key => $value) {
					if (!(is_numeric($key)))	{
						error_log("getSelectDatas DETAILS = " . $key . " => " . $value);
						if (!is_null($value))	{
							if ((isset($bForJS)) && (($bForJS == 1) || ($bForJS == 2)))	{
								$value= str_replace("__SIMPLEQUOT__", "'", $value);
								$value= str_replace('__DOUBLEQUOT__', '\"', $value);
								$value= str_replace("__POINTVIRGULE__", ";", $value);
								/*if ($bForJS == 2)	{
									$value= utf8_encode($value);
								}*/
							}  else  {
								$value= str_replace("__SIMPLEQUOT__", "'", $value);
								$value= str_replace('__DOUBLEQUOT__', '"', $value);
								$value= str_replace("__POINTVIRGULE__", ";", $value);
							}
							$new_ligne[$key]= $value;
						}
					}
				}
				$resultat[]= $new_ligne;
			}
		}

		return $resultat;
	}

	/**
	 * Execute insert / update / delete method
	 *
	 */
	function treatDatas($spathSQL, $data=array())	{
		// content of SQL file
		$sql= file_get_contents($spathSQL);

		// replace variables @variable from sql by values of the same variables'name
		foreach ($data as $key => $value) {
			// security for SQL injection
			$value= str_replace("'", "__SIMPLEQUOT__", $value);
			$value= str_replace('"', '__DOUBLEQUOT__', $value);
			$value= str_replace(";", "__POINTVIRGULE__", $value);
			$sql= str_replace('@'.$key, $value, $sql);
		}
		error_log("treatDatas = " . $sql);

		// Execute la requete
		$resultat= [];
		$resultat["error"]= "";
		try {
			$this->_hDb->query($sql);
		}
		catch (PDOException $e) {
			$resultat["error"]= $e->getMessage();
			error_log("PDOException treatDatas = " . $resultat["error"]);
		}

		return $resultat;
	}

}
	
?>
