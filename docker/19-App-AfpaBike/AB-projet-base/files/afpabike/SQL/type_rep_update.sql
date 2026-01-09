UPDATE
    typerep
SET 
    nom_typerep='@nom_typerep',
    duree_typerep='@duree_typerep',
    actif_typerep='@actif_typerep'
WHERE 
    id_typerep = @id_typerep;