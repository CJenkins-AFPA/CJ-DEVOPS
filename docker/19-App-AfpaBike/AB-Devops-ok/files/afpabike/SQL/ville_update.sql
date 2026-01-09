UPDATE
    ville
SET 
    nom_ville='@nom_ville',
    actif_ville='@actif_ville'
WHERE 
    id_ville = @id_ville
