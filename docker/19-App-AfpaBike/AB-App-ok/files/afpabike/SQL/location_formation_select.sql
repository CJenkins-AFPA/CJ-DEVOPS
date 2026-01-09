SELECT 
    formation.id_formation,
    formation.nom_formation
FROM 
    formation
WHERE 
    formation.actif_formation = 1
ORDER BY 
    formation.nom_formation;