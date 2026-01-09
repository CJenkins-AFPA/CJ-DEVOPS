update  accessoire set nom_accessoire="@nom_accessoire", etat_accessoire="@etat_accessoire",dispo_accessoire="@dispo_accessoire", photo_accessoire="@photo_accessoire", couleur_accessoire="@couleur_accessoire", 
  numeroserie_accessoire ="@numeroserie_accessoire", prix_accessoire  ="@prix_accessoire", taille_accessoire="@taille_accessoire" ,particularite_accessoire="@particularite_accessoire" ,numeroafpa_accessoire="@numeroafpa_accessoire",
  actif_accessoire="@actif_accessoire"

 where id_accessoire=@id_accessoire;

 