UPDATE
    type_utilisateur
SET 
    nom_type_utilisateur='@nom_type_utilisateur',
    actif_type_utilisateur='@actif_type_utilisateur'
WHERE 
    id_type_utilisateur = @id_type_utilisateur
