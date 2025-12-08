// Données liste des vélos
var aofvelo= [];

// Données liste des marques
var aofmarque= [];

// Données liste des modèles
var aofmodele= [];

// Données liste des caution
var aofcaution= [];
aofcaution[0]= [];
aofcaution[0]["id_caution"]= "1";
aofcaution[0]["libelle_caution"]= "velo_caution";
aofcaution[0]["montant_caution"]= "80";
aofcaution[0]["actif_caution"]= "1";

// Données liste des types de vélos
var aoftype= [];

// Données liste des types de vélos
var aofdispo= [];
aofdispo[0]= [];
aofdispo[0]["dispo_velo"]= "Disponible";

aofdispo[1]= [];
aofdispo[1]["dispo_velo"]= "En cours de location";

aofdispo[2]= [];
aofdispo[2]["dispo_velo"]= "En cours de réparation";

aofdispo[3]= [];
aofdispo[3]["dispo_velo"]= "Perdu / Volé";

/**
 * Get Bikes from database
 *
 * if OK add bikes to array aofvelo
 *
 * if OK then build table and call datatable
 */
function loadVelos()	{
    $('#divModalSaving').show();
    var datas = {
        page : "velo_liste",
        bJSON : 1
    }
    $.ajax({
        type: "POST",
        url: "route.php",
        async: true,
        data: datas,
        dataType: "json",
        cache: false,
    })
    .done(function(result) {
        console.log(result);
        aofvelo= result;
        // INIT DATATABLE
        constructTable();
        tables = $('#vel_table_velo').DataTable(vel_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

/**
 * Get Bikes from database
 *
 * if OK add bikes to array aofvelo
 *
 * if OK then build table and call datatable
 */
function loadVelosMarque()	{
    $('#divModalSaving').show();
    var datas = {
        page : "velo_marque_liste",
        bJSON : 1
    }
    $.ajax({
        type: "POST",
        url: "route.php",
        async: true,
        data: datas,
        dataType: "json",
        cache: false,
    })
    .done(function(result) {
        console.log(result);
        aofmarque= result;
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

/**
 * Get Bikes from database
 *
 * if OK add bikes to array aofvelo
 *
 * if OK then build table and call datatable
 */
function loadVelosModele()	{
    $('#divModalSaving').show();
    var datas = {
        page : "velo_modele_liste",
        bJSON : 1
    }
    $.ajax({
        type: "POST",
        url: "route.php",
        async: true,
        data: datas,
        dataType: "json",
        cache: false,
    })
    .done(function(result) {
        console.log(result);
        aofmodele= result;
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

// Construction du tableau gestion des vélos
function constructTable()	{
var i;

var sHTML= "";
sHTML+= "<thead>";
sHTML+= "<tr>";
sHTML+= "<th>Numéro AFPA</th>";
sHTML+= "<th>Marque</th>";
sHTML+= "<th>Type</th>";
sHTML+= "<th>Modele</th>";
sHTML+= "<th>Statut</th>";
sHTML+= "<th>EDITER/SUPPRIMER</th>";
sHTML+= "</tr>";
sHTML+= "</thead>";
sHTML+= "<tbody>";

    for (i=0; i<aofvelo.length; i++)	{
        sHTML+= "<tr>";
        sHTML+= "<td>" + aofvelo[i]["numeroafpa_velo"] + "</td>";
        sHTML+= "<td>" + aofvelo[i]["nom_marque"] + "</td>";
        sHTML+= "<td>" + aofvelo[i]["nom_type_velo"] + "</td>";
        sHTML+= "<td>" + aofvelo[i]["nom_modele"] + "</td>";
        sHTML+= "<td>" + aofvelo[i]["dispo_velo"] + "</td>";
        sHTML += "<td><img src=\"image/modifier.png\" alt=\"Editer\" data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\" onClick=\"editvelo(" + i + ")\" style=\"cursor: pointer; width: 20px; height: 20px; margin-right: 70px;\" class=\"edit-btn\"><img src=\"image/supprimer.png\" onClick=\"confirmsupprim(" + i + ")\" alt=\"Supprimer\" style=\"cursor: pointer; width: 20px; height: 20px;\" class=\"delete-btn\"></td>";
        sHTML+= "</tr>";
    }

    sHTML+= "</tbody>";
    $('#vel_table_velo').html(sHTML);
}


function ajoutvelo() {

    // Longueur actuel du tableau JS :
    var iLongueur= aofvelo.length;

    // ajout une personne en fin de tableau JS
    aofvelo[iLongueur]= [];
    aofvelo[iLongueur]["numeroafpa_velo"]= $('#numeroafpa_velo').val();
    aofvelo[iLongueur]["Marque"]= $('#vel_marque').val();
    aofvelo[iLongueur]["Type"]= $('#vel_type').val();
    aofvelo[iLongueur]["Modele"]= $('#vel_modele').val();
    aofvelo[iLongueur]["Etat"]= $('#vel_etat').val();
    aofvelo[iLongueur]["Statut"]= $('#vel_statut').val();
    aofvelo[iLongueur]["Couleur"]= $('#vel_couleur').val();
    aofvelo[iLongueur]["Fiche active"] = $('#vel_ficheactive').is(':checked');

    
    // Reconstruire le tableau HTML
    rebuildDatable();
    
    // Vider le formulaire
    videFormulaire();

}


function rebuildDatable()	{
    $('#vel_table_velo').html("");
    tables.clear(); 
    tables.destroy(); 
    constructTable();
    tables = $('#vel_table_velo').DataTable(vel_configuration);
}


function videFormulaire()	{
    $("#vel_num_afpa").val("");
    $("#vel_marque").val("");
    $("#vel_type").val("");
    $("#vel_modele").val("");
    $("#vel_etat").val(0);
    $('input[id="vel_disp"]').prop('checked', true);
    $('#vel_couleur').val(0);
    $('#vel_ficheactive').prop('checked', true);
}


function supprimcommande(index) {
    aofvelo.splice(index, 1);
    rebuildDatable();
}


function confirmsupprim(index) {
    // Afficher une boîte de dialogue de confirmation
    var confirmation = confirm("Confirmez-vous la suppression de cette commande ?");

    // Si l'utilisateur confirme, appeler la fonction de suppression
    if (confirmation) {
        supprimcommande(index);
    }
}


var currentIndex = -1;

function editvelo(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#numeroafpa_velo').val(aofvelo[i]["numeroafpa_velo"]);
    $('#id_marque').val(aofvelo[i]["id_marque"]);
    $('#vel_type').val(aofvelo[i]["Type"]);
    $('#vel_modele').val(aofvelo[i]["Modele"]);
    $('#etat_velo').val(aofvelo[i]["etat_velo"]);
    $('#couleur_velo').val(aofvelo[i]["couleur_velo"]);
    $('#vel_ficheactive').prop('checked', aofvelo[i]["Fiche active"]);

    // Sélectionner l'input radio correspondant
    $('input[name="vel_statut"][value="' + aofvelo[i]["Statut"] + '"]').prop('checked', true);

    // Initialiser les boutons
    var btnAjouter = document.getElementById("ajouter");
    var btnModifier = document.getElementById("modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


function fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("ajouter");
    var btnModifier = document.getElementById("modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}


function majvelo() {
    if (currentIndex >= 0) {
    
        // Mettre à jour les valeurs dans le tableau aofvelo
        aofvelo[currentIndex]["Numéro AFPA"] = $('#vel_num_afpa').val();
        aofvelo[currentIndex]["Marque"] = $('#vel_marque').val();
        aofvelo[currentIndex]["Type"] = $('#vel_type').val();
        aofvelo[currentIndex]["Modele"] = $('#vel_modele').val();
        aofvelo[currentIndex]["Etat"] = $('#vel_etat').val();
        aofvelo[currentIndex]["Couleur"] = $('#vel_couleur').val();
        aofvelo[currentIndex]["Statut"] = $('input[id="vel_disp"]').is(':checked');
        aofvelo[currentIndex]["Fiche active"] = $('#vel_ficheactive').is(':checked');

        // Reconstruire le tableau HTML
        rebuildDatable();

        // fermer la modal
        fermeturemodal();

        // Réinitialiser l'index de la commande en cours d'édition
        currentIndex = -1;

    }
}


const vel_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["Dix", "Vingt cinq", "Cinquante", "Cent", "Tous"]],
    "language": {
        "info": "Vélos _START_ à _END_ sur _TOTAL_ sélectionnés",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ Vélos par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "Utilisateurs 0 à 0 sur 0 sélectionnée",
    },
    "columns": [
        {"orderable": true},
        {"orderable": true},
        {"orderable": true},
        {"orderable": true},
        {"orderable": true},
        {"orderable": false}
    ],
    "dom": 'Blfrtip',  // 'l' pour le nombre de lignes, 'B' pour les boutons
    "buttons": [
         'pdf', 'print'
    ],
    'retrieve': true
};


var tables;
$(document).ready(function() {
    loadVelos();
    loadVelosMarque();
    loadVelosModele();
    /*constructTable();
    // INIT DATATABLE
    tables = $('#vel_table_velo').DataTable(vel_configuration);
    */
});