UPDATE
    marque
SET 
    nom_marque='@nom_marque',
    actif_marque='@actif_marque'
WHERE 
    id_marque = @id_marque
