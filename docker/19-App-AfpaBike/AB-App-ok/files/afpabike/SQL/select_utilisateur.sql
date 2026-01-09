SELECT 
    id_utilisateur, 
    ville.id_ville, 
    formation.id_formation, 
    type_utilisateur.id_type_utilisateur, 
    type_utilisateur.nom_type_utilisateur, 
    nom_utilisateur, 
    prenom_utilisateur, 
    login_utilisateur, 
    mdp_utilisateur, 
    debutformation_utilisateur, 
    DATE_FORMAT(debutformation_utilisateur, "%d/%m/%Y") as debutformation_utilisateur_lisible,
    finformation_utilisateur, 
    DATE_FORMAT(finformation_utilisateur, "%d/%m/%Y") as finformation_utilisateur_lisible,
    email_utilisateur, 
    tel_utilisateur, 
    adresse_utilisateur, 
    codepostal_utilisateur, 
    complementadresse_utilisateur, 
    dateinscription_utilisateur,
    DATE_FORMAT(dateinscription_utilisateur, "%d/%m/%Y") as dateinscription_utilisateur_lisible, 
    dateconnexion_utilisateur, 
    DATE_FORMAT(dateconnexion_utilisateur, "%d/%m/%Y") as dateconnexion_utilisateur_lisible,
    actif_utilisateur

FROM 
    utilisateur
INNER JOIN 
    ville ON utilisateur.id_ville = ville.id_ville
LEFT JOIN 
    formation ON utilisateur.id_formation = formation.id_formation 
INNER JOIN
    type_utilisateur ON utilisateur.id_type_utilisateur= type_utilisateur.id_type_utilisateur  
ORDER BY 
    id_utilisateur