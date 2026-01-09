<?php

$sFileDatas= file_get_contents("datas_marque.txt");
$aOfLinesDatas= explode("\n", $sFileDatas);
$aOfRepMarque= [];

for ($i=0; $i<count($aOfLinesDatas); $i++){
    if ($aOfLinesDatas[$i] != ""){
        $aOfLinesDatas[$i]= str_replace("\r", "", $aOfLinesDatas[$i]);
        $aOfRepMarque[$i]["marque"]=$aOfLinesDatas[$i];
    }
}
echo json_encode($aOfRepMarque);
?>