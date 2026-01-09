SELECT 
    contrat__accessoire.id_contrat,
    contrat__accessoire.id_accessoire,
    accessoire.id_accessoire,
    accessoire.nom_accessoire,
    accessoire.taille_accessoire,
    accessoire.particularite_accessoire
FROM 
    contrat__accessoire
INNER JOIN 
    accessoire ON contrat__accessoire.id_accessoire=accessoire.id_accessoire
INNER JOIN
    contrat on contrat__accessoire.id_contrat = contrat.id_contrat
WHERE
    contrat__accessoire.id_contrat="@id_contrat";