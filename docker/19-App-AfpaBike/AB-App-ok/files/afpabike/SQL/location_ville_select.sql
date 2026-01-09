SELECT 
    ville.id_ville,
    ville.nom_ville
FROM 
    ville
WHERE 
    ville.actif_ville = 1
ORDER BY 
    ville.nom_ville;
