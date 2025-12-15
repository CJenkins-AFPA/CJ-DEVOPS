INSERT INTO 
contrat

(id_utilisateur, 
id_velo, 
date_contrat,
numero_contrat,
datedebut_loc_contrat,
datefin_loc_contrat,
commentaire_contrat,
id_type_identite, 
numeroidentite_contrat) 

VALUES 

(@id_utilisateur,
@id_velo,
NOW(),
CONCAT(YEAR(NOW()), '_@num_contrat'),
'@datedebut_loc_contrat',
'@datefin_loc_contrat',
'@commentaire_contrat',
@id_type_identite,
'@numeroidentite_contrat');