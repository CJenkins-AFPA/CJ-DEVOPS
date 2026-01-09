UPDATE
    contrat
SET 
    id_velo = @id_velo,
    id_utilisateur = @id_utilisateur,
    id_type_identite = @id_type_identite,
    numeroidentite_contrat='@numeroidentite_contrat',
    datedebut_loc_contrat='@datedebut_loc_contrat',
    datefin_loc_contrat='@datefin_loc_contrat',
    commentaire_contrat='@commentaire_contrat',
    retenue_caution='@retenue_caution',
    actif_contrat= "@actif_contrat"
WHERE 
    id_contrat = @id_contrat;