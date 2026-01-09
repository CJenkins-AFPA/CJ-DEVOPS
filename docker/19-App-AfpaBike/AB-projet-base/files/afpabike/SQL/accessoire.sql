SELECT 
    contrat.id_contrat, 
    contrat.numero_contrat, 
    velo.id_velo,
    utilisateur.id_utilisateur,
    utilisateur.nom_utilisateur,
    utilisateur.tel_utilisateur,
    contrat.datedebut_loc_contrat,
    contrat.datefin_loc_contrat,
FROM 
    contrat
INNER JOIN 
    velo ON contrat.id_velo = velo.id_velo
INNER JOIN 
    utilisateur ON contrat.id_utilisateur = utilisateur.id_utilisateur
ORDER BY 
    contrat.numero_contrat;