SELECT 
    type_utilisateur.id_type_utilisateur,
    type_utilisateur.nom_type_utilisateur,
    type_utilisateur.actif_type_utilisateur
FROM 
    type_utilisateur
ORDER BY 
    type_utilisateur.id_type_utilisateur;