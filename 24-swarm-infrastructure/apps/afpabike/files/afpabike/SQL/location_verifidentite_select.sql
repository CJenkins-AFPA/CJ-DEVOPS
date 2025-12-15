SELECT 
    type_identite.id_type_identite,
    type_identite.nom_type_identite
FROM 
    type_identite
WHERE 
    type_identite.actif_type_identite = 1
ORDER BY 
    type_identite.nom_type_identite;