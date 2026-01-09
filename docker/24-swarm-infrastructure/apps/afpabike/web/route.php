<?php
/**
 * Router | file route.php
 *
 * This is the main program of the project.
 * We must use this file, if we want to access of all others classes.
 *
 * @package Cinema Project
 * @subpackage configuration
 * @author @Afpa Lab Team
 * @copyright  1920-2080 The Afpa Lab Team Group Corporation World Company
 * @version v1.0
 */
 
/**
 * We start the session
 */
session_start();

/**
 * We get the content of the config file.
 */
require "configuration.php";
$GLOBALS_INI= Configuration::getGlobalsINI();

/**
 * We get the page parameter, needed to call the class.
 */
if ((isset($_GET["page"])) && ($_GET["page"] != ""))	{
	$monPHP= $_GET["page"];
}  else  {
	if ((isset($_POST["page"])) && ($_POST["page"] != ""))	{
		$monPHP= $_POST["page"];
	}  else  {
		$monPHP= "connection";
	}
}

/**
 * List of classes authorized when you are NOT connected.
 * If not, redirect to a specific class
 */
/*
$list_class = array("connection", "logout");
if(!isset($_SESSION["id_utilisateur"]) || (isset($_SESSION["id_utilisateur"]) && $_SESSION["id_utilisateur"]= "")){
	if(!in_array($monPHP, $list_class)){
		$monPHP = "connection";
	}
}
*/
/**
 * Test if classes exist.
 * If not, redirect to a specific class
 */
if (!(file_exists($GLOBALS_INI["PATH_HOME"] . $GLOBALS_INI["PATH_CLASS"] . $monPHP . ".php"))) {
	$monPHP= "connection";
}

/**
 * Instantiation of the dynamic class
 */
$myClass= ucfirst($monPHP);
require $GLOBALS_INI["PATH_HOME"] . $GLOBALS_INI["PATH_CLASS"] . $monPHP . ".php";
$oMain= new $myClass();

/**
 * Call the view "route.html".
 * If parameter bJSON is passed and set to 1, we load another HTML page.
 */
$page_to_load= "route.html";
if ((isset($oMain->VARS_HTML["bJSON"])) && ($oMain->VARS_HTML["bJSON"] == 1))	{
	$page_to_load= $monPHP . ".html";
}

require $GLOBALS_INI["PATH_HOME"] . $GLOBALS_INI["PATH_FILES"] . $page_to_load;

/**
 * Destroy $oMain object.
 */
unset($oMain);
?>




