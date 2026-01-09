UPDATE 
utilisateur 

SET 
id_ville="@id_ville",
id_formation="@id_formation",
id_type_utilisateur="@id_type_utilisateur",
nom_utilisateur="@nom_utilisateur",
prenom_utilisateur="@prenom_utilisateur",
login_utilisateur="@login_utilisateur",
mdp_utilisateur="@mdp_utilisateur",
debutformation_utilisateur="@debutformation_utilisateur",
finformation_utilisateur="@finformation_utilisateur",
email_utilisateur="@email_utilisateur",
tel_utilisateur="@tel_utilisateur",
adresse_utilisateur="@adresse_utilisateur",
codepostal_utilisateur="@codepostal_utilisateur",
complementadresse_utilisateur="@complementadresse_utilisateur",
dateinscription_utilisateur="@dateinscription_utilisateur", 

WHERE
id_utilisateur=@id_utilisateur