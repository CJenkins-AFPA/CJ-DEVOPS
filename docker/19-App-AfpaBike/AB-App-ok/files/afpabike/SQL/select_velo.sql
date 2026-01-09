select velo.id_velo, velo.id_caution, velo.id_modele, velo.numeroserie_velo, velo.numeroafpa_velo, velo.dispo_velo, velo.photo_velo, velo.couleur_velo, velo.etat_velo, velo.actif_velo , 
modele.nom_modele, marque.nom_marque, type_velo.nom_type_velo
from velo 
INNER JOIN modele ON velo.id_modele=modele.id_modele
INNER JOIN marque ON modele.id_marque=marque.id_marque
INNER JOIN type_velo ON modele.id_type_velo=type_velo.id_type_velo