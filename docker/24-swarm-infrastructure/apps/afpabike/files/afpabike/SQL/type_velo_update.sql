UPDATE
    type_velo
SET 
    nom_type_velo='@nom_type_velo',
    actif_type_velo='@actif_type_velo'
WHERE 
    id_type_velo = @id_type_velo
