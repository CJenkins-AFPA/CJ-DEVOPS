SELECT 
    velo.id_velo,
    velo.id_modele,
    velo.numeroafpa_velo,
    modele.id_modele,
    modele.nom_modele,
    modele.id_type_velo,
    type_velo.id_type_velo,
    type_velo.nom_type_velo,
    modele.id_marque,
    marque.id_marque,
    marque.nom_marque,
    velo.actif_velo,
    velo.etat_velo
FROM 
    velo
INNER JOIN
    modele ON velo.id_modele = modele.id_modele
INNER JOIN
    type_velo ON modele.id_type_velo = type_velo.id_type_velo
INNER JOIN
    marque ON modele.id_marque = marque.id_marque
WHERE
    velo.actif_velo = 1;