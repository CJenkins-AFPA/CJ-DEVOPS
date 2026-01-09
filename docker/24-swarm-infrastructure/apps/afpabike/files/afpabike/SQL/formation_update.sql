UPDATE
    formation
SET 
    nom_formation='@nom_formation',
    actif_formation='@actif_formation'
WHERE 
    id_formation = @id_formation
