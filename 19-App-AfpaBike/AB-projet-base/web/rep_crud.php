<?php
if ($_POST["action"] == "liste")	{
$sFileDatas= file_get_contents("datas.txt");
$aOfLinesDatas= explode("\n", $sFileDatas);
$aOfRep= [];

for ($i=0; $i<count($aOfLinesDatas); $i++){
    if ($aOfLinesDatas[$i] != ""){
        $aOfLinesDatas[$i]= str_replace("\r", "", $aOfLinesDatas[$i]);
        list($marque, $model, $num, $date_entree, $date_sortie, $piece, $temps )= explode("||", $aOfLinesDatas[$i]);

    $aOfRep[$i]["marque"]= $marque;
    $aOfRep[$i]["model"]= $model;
    $aOfRep[$i]["num"]= $num;
    $aOfRep[$i]["date_entree"]= $date_entree;
    $aOfRep[$i]["date_sortie"]= $date_sortie;
    $aOfRep[$i]["piece"]= $piece;
    $aOfRep[$i]["temps"]= $temps;
    }
}
echo json_encode($aOfRep);
}

if ($_POST["action"] == "enregistrement"){
    // J'ouvre le fichier eet j'écrase / remplace tout son contenu par le nouveau contenu généré par le JS
    file_put_contents("datas.txt", $_POST["sListeRep"]);
    
    // Je crée une réponse forcément avec un tableau avec un indice et un niveau associatif
    $aOfReponse= [];
    $aOfReponse[0]["error"]= 0;
    
    // Je transforme mon tableau final aOfDatas en format JSON pour que le JS qui le reçoit puisse l'interpréter
    echo json_encode($aOfReponse);
    }
?>