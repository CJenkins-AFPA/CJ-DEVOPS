UPDATE
    contrat
SET 
    datefin_loc_contrat='@datefin_loc_contrat',
    commentaire_contrat='@commentaire_contrat',
    retenue_caution='@retenue_caution',
    actif_contrat= "0"
WHERE 
    id_contrat = @id_contrat;