SELECT 
    contrat.id_contrat, 
    contrat.numero_contrat,
    contrat.id_type_identite,
    contrat.numeroidentite_contrat, 
    velo.id_velo,
    velo.numeroafpa_velo,
    velo.id_modele,
    modele.id_modele,
    modele.nom_modele,
    modele.id_type_velo,
    type_velo.id_type_velo,
    type_velo.nom_type_velo,
    modele.id_marque,
    marque.id_marque,
    marque.nom_marque,
    utilisateur.id_utilisateur,
    utilisateur.nom_utilisateur,
    utilisateur.prenom_utilisateur,
    utilisateur.tel_utilisateur,
    utilisateur.email_utilisateur,
    utilisateur.id_formation,
    utilisateur.id_type_utilisateur,
    utilisateur.id_ville,
    utilisateur.adresse_utilisateur,
    utilisateur.codepostal_utilisateur,
    contrat.datedebut_loc_contrat,
    contrat.datefin_loc_contrat,
    contrat.commentaire_contrat
FROM 
    contrat
INNER JOIN 
    velo ON contrat.id_velo = velo.id_velo
INNER JOIN 
    modele ON velo.id_modele = modele.id_modele
INNER JOIN 
    marque ON modele.id_marque = marque.id_marque
INNER JOIN 
    type_velo ON modele.id_type_velo = type_velo.id_type_velo
INNER JOIN 
    utilisateur ON contrat.id_utilisateur = utilisateur.id_utilisateur
WHERE 
    contrat.actif_contrat= 1
ORDER BY 
    contrat.numero_contrat;