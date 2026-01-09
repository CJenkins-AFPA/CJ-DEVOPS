SELECT 
    reparation.id_reparation,
    velo.id_velo, 
    velo.id_modele, 
    modele.id_marque,
    modele.nom_modele,
    marque.nom_marque,
    velo.numeroafpa_velo,
    reparation.datedebut_reparation,
    reparation.datefin_reparation,
    reparation.id_velo,
    reparation.id_typerep,
    typerep.nom_typerep,
    typerep.duree_typerep

FROM 
    reparation
INNER JOIN 
    velo ON reparation.id_velo = velo.id_velo
INNER JOIN 
    modele ON velo.id_modele=modele.id_modele 
INNER JOIN 
    marque ON modele.id_marque= marque.id_marque  
INNER JOIN
    typerep ON reparation.id_typerep= typerep.id_typerep   

ORDER BY 
    marque.id_marque;