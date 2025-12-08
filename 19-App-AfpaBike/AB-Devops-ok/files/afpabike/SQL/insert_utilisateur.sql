INSERT INTO 
utilisateur ( 
    nom_utilisateur, 
    prenom_utilisateur, 
    login_utilisateur, 
    mdp_utilisateur, 
    debutformation_utilisateur, 
    DATE_FORMAT(debutformation_utilisateur, "%d/%m/%Y") as debutformation_utilisateur_lisible,
    finformation_utilisateur, 
    DATE_FORMAT(finformation_utilisateur, "%d/%m/%Y") as finformation_utilisateur_lisible,
    email_utilisateur, 
    tel_utilisateur, 
    adresse_utilisateur, 
    codepostal_utilisateur, 
    complementadresse_utilisateur, 
    dateinscription_utilisateur)

VALUES
( "@id_ville", 
 "@id_formation", 
 "@id_type_utilisateur", 
 "@nom_utilisateur", 
 "@prenom_utilisateur", 
 "@login_utilisateur", 
 "@mdp_utilisateur", 
 "@debutformation_utilisateur", 
 "@finformation_utilisateur", 
 "@email_utilisateur", 
 "@tel_utilisateur", 
 "@adresse_utilisateur", 
 "@codepostal_utilisateur", 
 "@complementadresse_utilisateur", 
 "@dateinscription_utilisateur")
