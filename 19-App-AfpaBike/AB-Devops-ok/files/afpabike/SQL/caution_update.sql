UPDATE
    caution
SET 
    libelle_caution='@libelle_caution',
    montant_caution='@montant_caution',
    actif_caution='@actif_caution'
WHERE 
    id_caution = @id_caution
