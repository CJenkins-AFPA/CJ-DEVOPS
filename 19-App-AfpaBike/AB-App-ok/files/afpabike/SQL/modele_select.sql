SELECT 
    modele.id_modele,
    modele.nom_modele,
    type_velo.id_type_velo,
    type_velo.nom_type_velo,
    marque.id_marque,
    marque.nom_marque,
    modele.actif_modele
FROM 
    modele
INNER JOIN 
    type_velo ON modele.id_type_velo = type_velo.id_type_velo
INNER JOIN 
    marque ON modele.id_marque = marque.id_marque
ORDER BY 
    modele.id_modele;