UPDATE
    modele
SET 
    nom_modele='@nom_modele',
    actif_modele='@actif_modele',
    id_type_velo='@id_type_velo',
    id_marque='@id_marque'
WHERE 
    id_modele = @id_modele
