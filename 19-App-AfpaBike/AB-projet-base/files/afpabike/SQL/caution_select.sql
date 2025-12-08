SELECT 
    caution.id_caution,
    caution.libelle_caution,
    caution.montant_caution,
    caution.actif_caution
FROM 
    caution
ORDER BY 
    caution.id_caution;