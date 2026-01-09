SELECT 
    type_utilisateur.id_type_utilisateur,
    type_utilisateur.nom_type_utilisateur
FROM 
    type_utilisateur
WHERE 
    type_utilisateur.actif_type_utilisateur = 1
ORDER BY 
    type_utilisateur.nom_type_utilisateur;