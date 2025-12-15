//------------------------------------Tableau general------------------------------------
var aOfLocation_gestion= [];
var aOfLocation_contrat= [];

function loadLocation_gestion() {
    var datas = {
        page : "location_gestion_liste",
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
        var iLocation_gestion= 0;
        for (var ligne in result)	{
            aOfLocation_gestion[iLocation_gestion]= [];
            aOfLocation_gestion[iLocation_gestion]["numero_contrat"]= result[ligne]["numero_contrat"];
            aOfLocation_gestion[iLocation_gestion]["id_contrat"]= result[ligne]["id_contrat"];
            aOfLocation_gestion[iLocation_gestion]["actif_contrat"]= result[ligne]["actif_contrat"];
            aOfLocation_gestion[iLocation_gestion]["id_velo"]= result[ligne]["id_velo"];
            aOfLocation_gestion[iLocation_gestion]["numeroafpa_velo"]= result[ligne]["numeroafpa_velo"];
            aOfLocation_gestion[iLocation_gestion]["id_modele"]= result[ligne]["id_modele"];
            aOfLocation_gestion[iLocation_gestion]["nom_modele"]= result[ligne]["nom_modele"];
            aOfLocation_gestion[iLocation_gestion]["id_type_velo"]= result[ligne]["id_type_velo"];
            aOfLocation_gestion[iLocation_gestion]["nom_type_velo"]= result[ligne]["nom_type_velo"];
            aOfLocation_gestion[iLocation_gestion]["id_marque"]= result[ligne]["id_marque"];
            aOfLocation_gestion[iLocation_gestion]["nom_marque"]= result[ligne]["nom_marque"];
            aOfLocation_gestion[iLocation_gestion]["id_utilisateur"]= result[ligne]["id_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["prenom_utilisateur"]= result[ligne]["prenom_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["email_utilisateur"]= result[ligne]["email_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["id_type_utilisateur"]= result[ligne]["id_type_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["id_formation"]= result[ligne]["id_formation"];
            aOfLocation_gestion[iLocation_gestion]["adresse_utilisateur"]= result[ligne]["adresse_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["id_ville"]= result[ligne]["id_ville"];
            aOfLocation_gestion[iLocation_gestion]["codepostal_utilisateur"]= result[ligne]["codepostal_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["nom_utilisateur"]= result[ligne]["nom_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["tel_utilisateur"]= result[ligne]["tel_utilisateur"];
            aOfLocation_gestion[iLocation_gestion]["id_type_identite"]= result[ligne]["id_type_identite"];
            aOfLocation_gestion[iLocation_gestion]["numeroidentite_contrat"]= result[ligne]["numeroidentite_contrat"];
            aOfLocation_gestion[iLocation_gestion]["datedebut_loc_contrat"]= result[ligne]["datedebut_loc_contrat"];
            aOfLocation_gestion[iLocation_gestion]["datefin_loc_contrat"]= result[ligne]["datefin_loc_contrat"];
            aOfLocation_gestion[iLocation_gestion]["retenue_caution"]= result[ligne]["retenue_caution"];
          
            iLocation_gestion++;


        }
        // htmlspecialchars_decode
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        gestioncreationtableau();
        tables = $('#table_gestionloc').DataTable(location_gestion_configuration);
        for (var iligne = 0; iligne < aOfLocation_gestion.length; iligne++) {
            ficheactive = aOfLocation_gestion[iligne]["actif_contrat"];
        if ( ficheactive == "1") {
            $("#actif_contrat").prop('checked', true);
        }
        }
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

// Les différentes variables des boutons
var btnajouter = document.getElementById("btnajouter");
var btnmodifier = document.getElementById("btnmodifier");
var btnannuler = document.getElementById("btnannuler");


//------------------------------------Fonction permettant la création du tableau------------------------------------
function gestioncreationtableau() {
    let y;
    sActif = "";

    //Incrémentation d'HTML a l'ID =" table_gestionloc"
    let gestionsHTML = "<thead>";
    gestionsHTML += "<tr>";
    gestionsHTML += "<td>Contrat  <img src=\"image/location/contrat.png\"></td>";
    gestionsHTML += "<td>Vélo <img src=\"image/location/velo.png\"></td>";
    gestionsHTML += "<td>Nom" + "<br>" + "<img src=\"image/location/contact.png\"></td>";
    gestionsHTML += "<td>Date début " + "<br>" + "(Année/Mois/Jour) <img src=\"image/location/date_schedule_calendar_icon_262708.png\"></td>";
    gestionsHTML += "<td>Date fin " + "<br>" + "(Année/Mois/Jour) <img src=\"image/location/date_schedule_calendar_icon_262708.png\"></td>";
    gestionsHTML += "<td> Disponibilité </td>";
    gestionsHTML += "<td>Modifier</td>";
    gestionsHTML += "<td>Supprimer</td>";
    gestionsHTML += "</tr>";
    gestionsHTML += "</thead>";
    gestionsHTML += "<tbody>";

    // Boucle permettant l'initialisation des tableaux précedemment saisis
    for (y = 0; y <  aOfLocation_gestion.length; y++) {

        if (aOfLocation_gestion[y]["actif_contrat"] == "1") {
            sActif ="En location"
        } else {
            sActif ="Disponible"
        }
        gestionsHTML += "<tr>";
        gestionsHTML += "<td>" + aOfLocation_gestion[y]["numero_contrat"] + "</td>";
        gestionsHTML += "<td>" + aOfLocation_gestion[y]["nom_marque"] + " | " + aOfLocation_gestion[y]["nom_modele"] + " | " + aOfLocation_gestion[y]["nom_type_velo"] + " | N°" + aOfLocation_gestion[y]["numeroafpa_velo"] +  "</td>";
        gestionsHTML += "<td>" + aOfLocation_gestion[y]["nom_utilisateur"] + "</td>";
        gestionsHTML += "<td>" + aOfLocation_gestion[y]["datedebut_loc_contrat"] + "</td>";
        gestionsHTML += "<td>" + aOfLocation_gestion[y]["datefin_loc_contrat"] + "</td>";
        gestionsHTML += "<td>" + sActif + "</td>";
        gestionsHTML += `<td> <img onClick=\"editContrat_gestion(${y})\" src='image/edit.png' alt='Edit' style='width :25px'></td>`
        gestionsHTML += `<td> <img onClick=\"supprimContrat(${y})\" src='image/delete.png'  alt='Delete' style='width :25px'></td>`
        gestionsHTML += "</tr>";
    }

    gestionsHTML += "</tbody>";
    $('#table_gestionloc').html(gestionsHTML);
}


//------------------------------------Fonction permettant de reconstruire le tableau------------------------------------
function gestionrebuildDatable() {
    $('#table_gestionloc').html("");
    //Suppresion du tableau en entier
    table.clear();
    table.destroy();
    // Recréaction du tableau avec la librairie DataTable
    gestioncreationtableau();
    table = $('#table_gestionloc').DataTable(location_gestion_configuration);
}

function ModifLocation_contrat()	{
	$('#divModalSaving').show();
    var sRetenue = "";

    $("input[type='radio'][name='retenue_caution']").each(function() {
    if ($(this).is(':checked')) {
        sRetenue = $(this).val();
    }
    });

    if (sRetenue == "partielle") {
        sRetenue = $('#retenuepartielle_caution').val()
    }

    var aOfAccessoires= [];
    $("input[type='checkbox'][id='id_accessoire']").each(function(){
        if ($(this).prop('checked') == true)    {
            aOfAccessoires.push($(this).val());
        }
    });

    let ficheactive ="0"
    if ($('input[name="actif_contrat"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }
	var datas = {
		page : "location_gestion_update",
		bJSON : 1, 
        id_contrat: $('#id_contrat').val(),
        id_utilisateur: $('#id_utilisateur').val(),
        id_velo: $("#velo_list_marque option[value='"+$('#velo_datalist').val()+"']").attr("data-id-velo"),
        datedebut_loc_contrat: $('#datedebut_loc_contrat').val(),
        datefin_loc_contrat: $('#datefin_loc_contrat').val(),
        retenue_caution: sRetenue,
        commentaire_contrat: $('#commentaire_contrat').val(),
		actif_contrat: ficheactive,
        id_type_identite: $('#id_type_identite').val(),
        numeroidentite_contrat: $('#numeroidentite_contrat').val(),
        sListeAccessoires: aOfAccessoires.join("|")
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
		if (result[0]["error"] != "")	{
			$('#divModalSaving').hide();
			alert("Erreur lors de l'ajout du retour de location. Vous allez être déconnecté.");
			self.location.href= "route.php?page=location_contrat"
		}  else  {
			var iLongueur_gestion= aofLocation_gestion.length;
			aofLocation_gestion[iLongueur_gestion]= [];
			aofLocation_gestion[iLongueur_gestion]["id_contrat"]= $('#id_contrat').val();
			aofLocation_gestion[iLongueur_gestion]["datefin_loc_contrat"]= $('#datefin_loc_contrat').val();
            aofLocation_gestion[iLongueur_gestion]["retenue_caution"]= sRetenue;
            aofLocation_gestion[iLongueur_gestion]["commentaire_contrat"]= $('#commentaire_contrat').val();
            aofLocation_gestion[iLongueur_gestion]["numeroidentite_contrat"]= $('#numeroidentite_contrat').val();
            aofLocation_gestion[iLongueur_gestion]["commentaire_caution"]= $('#commentaire_caution').val();
            aofLocation_gestion[iLongueur_gestion]["id_velo"]= $("#velo_list_marque option[value='"+$('#velo_datalist').val()+"']").attr("data-id-velo");
            aofLocation_gestion[iLongueur_gestion]["id_type_utilisateur"]= $('#id_type_utilisateur').val();
            aofLocation_gestion[iLongueur_gestion]["id_utilisateur"]= $('#id_utilisateur').val();
            aofLocation_gestion[iLongueur_gestion]["actif_contrat"]= ficheactive ;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout du retour de location. Vous allez être déconnecté.");
		self.location.href= "route.php?page=location_contrat"
	});
}
var iIndiceModifEnCours
function editContrat_gestion(iIndiceModif) {
    document.getElementById("liste_utilisateur").style.display= "block";
    document.getElementById("debutformulaire").style.display= "block";
    iIndiceModifEnCours = iIndiceModif;
    if (aOfLocation_gestion[iIndiceModif]["actif_contrat"] == "1") {
        $("#actif_contrat").prop('checked', true)
    }
    else{
        $("#actif_contrat").prop('checked', false)
    }
    videFormulaire();
    //Scroll jusqu'au header
    document.getElementById('debutformulaire').scrollIntoView({ behavior: 'smooth' });
	$('#id_contrat').val(aOfLocation_gestion[iIndiceModif]["id_contrat"]);
    $('#id_utilisateur').val(aOfLocation_gestion[iIndiceModif]["id_utilisateur"]);
    $('#id_ville').val(aOfLocation_gestion[iIndiceModif]["id_ville"]);
    $('#id_type_utilisateur').val(aOfLocation_gestion[iIndiceModif]["id_type_utilisateur"]);
    $('#id_formation').val(aOfLocation_gestion[iIndiceModif]["id_formation"]);
    $('#email_utilisateur').val(aOfLocation_gestion[iIndiceModif]["email_utilisateur"]);
    $('#tel_utilisateur').val(aOfLocation_gestion[iIndiceModif]["tel_utilisateur"]);
    $('#adresse_utilisateur').val(aOfLocation_gestion[iIndiceModif]["adresse_utilisateur"]);
    $('#codepostal_utilisateur').val(aOfLocation_gestion[iIndiceModif]["codepostal_utilisateur"]);
	$('#nom_utilisateur').val(aOfLocation_gestion[iIndiceModif]["nom_utilisateur"]);
    $('#prenom_utilisateur').val(aOfLocation_gestion[iIndiceModif]["prenom_utilisateur"]);
    $('#numeroidentite_contrat').val(aOfLocation_gestion[iIndiceModif]["numeroidentite_contrat"]);
    $('#id_type_identite').val(aOfLocation_gestion[iIndiceModif]["id_type_identite"]);
    $("#velo_list_marque option").each(function(i){
        if ($("#velo_list_marque option[value='"+$(this).val()+"']").attr("data-id-velo") == (aOfLocation_gestion[iIndiceModif]["id_velo"])) {
            $('#velo_datalist').val( $(this).val() );
        }
    });
	$('#numeroafpa_velo').val(aOfLocation_gestion[iIndiceModif]["numeroafpa_velo"]);
	$('#datefin_loc_contrat').val(aOfLocation_gestion[iIndiceModif]["datefin_loc_contrat"]);
    $('#datedebut_loc_contrat').val(aOfLocation_gestion[iIndiceModif]["datedebut_loc_contrat"]);
	$('#commentaire_contrat').val(aOfLocation_gestion[iIndiceModif]["commentaire_contrat"]);
    $('input[name="retenue_caution"][value="' + aOfLocation_gestion[iIndiceModif]["retenue_caution"] + '"]').prop('checked', true);

    document.getElementById('divretenue').style.display = "block";
    loadLocation_gestion_accessoire();	
    //Cacher le bouton MODIFIER et ANNULER
    document.getElementById('btn_ajouter').style.display = "none";
    document.getElementById('btn_confirmer').style.display = "none";
    //Apparaître le bouton AJOUTER
    document.getElementById('btn_modifier').style.display = "inline-block";
    document.getElementById('btn_annuler').style.display = "inline-block";
    document.getElementById("champ_obligatoire").style.display = "block";
    document.getElementById('divactif').style.display = "block";

}
//------------------------------------Tableau choix Location_accessoire------------------------------------
var aOfLocation_gestion_accessoire= [];
//------------------------------------Fonction pour la creation de Location_accessoire------------------------------------
    function loadLocation_gestion_accessoire()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_gestion_accessoire_liste",
            bJSON : 1, 
            id_contrat : $('#id_contrat').val()
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
            aOfLocation_gestion_accessoire= result;
            for (var i=0; i<aOfLocation_gestion_accessoire.length; i++)  {
                if (aOfLocation_gestion_accessoire[i]["id_contrat"] == aOfLocation_gestion[iIndiceModifEnCours]["id_contrat"])  {
                    $('input[name="id_accessoire"][value="' + aOfLocation_gestion_accessoire[i]["id_accessoire"] + '"]').prop('checked', true);
                }
            }
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}
//------------------------------------Création d'une variable pour garder en mémoire l'index qu'on veut modifier------------------------------------
var iIndiceEditEnCours= -1;

function videFormulaire() {
    $('#id_contrat').val("");
    $('#id_ville').val("");
    $('#id_utilisateur').val("");
    $('#id_type_utilisateur').val("");
    $('#id_formation').val("");
    $('#email_utilisateur').val("");
    $('#tel_utilisateur').val("");
    $('#adresse_utilisateur').val("");
    $('#codepostal_utilisateur').val("");
	$('#nom_utilisateur').val("");
    $('#prenom_utilisateur').val("");
    $('#numeroidentite_contrat').val("");
    $('#id_type_identite').val("");
	$('#numeroafpa_velo').val("");
	$('#datefin_loc_contrat').val("");
    $('#datedebut_loc_contrat').val("");
	$('#commentaire_contrat').val("");
    $('input[name="retenue_caution"]').prop('checked', false);
    $('input[name="id_accessoire"]').prop("checked",false);
    // Sélectionner l'input correspondant à la datalist
    var veloliste = document.getElementById("velo_datalist"); 
    // Réinitialiser la valeur de l'input
    veloliste.value = ""; // Sélectionne l'option avec value=""
    // Sélectionner tous les éléments input de type "text"
    var inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"],input[type="tel"],input[name="velo_datalist"], input[name="datedebut_loc_contrat"]');

    // Parcourir chaque élément et définir l'attribut readonly
    inputs.forEach(function(input) {
        input.readOnly = false;  // Définit l'attribut readonly
    });
    //Apparaître le select FORMATION
    document.getElementById("formation").style.display = "block";
    // Remise par défaut des errreurs
    document.getElementById("id_utilisateur").style.border = '1px solid #dddddd';
    document.getElementById("error-id_utilisateur").style.display = 'none';
    document.getElementById("velo_datalist").style.border = '1px solid #dddddd';
    document.getElementById("error-velo_datalist").style.display = 'none';
    document.getElementById("datedebut_loc_contrat").style.border = '1px solid #dddddd';
    document.getElementById("error-datedebut_loc_contrat").style.display = 'none';
    document.getElementById("datefin_loc_contrat").style.border = '1px solid #dddddd';
    document.getElementById("error-datefin_loc_contrat").style.display = 'none';
    document.getElementById("id_type_identite").style.border = '1px solid #dddddd';
    document.getElementById("error-id_type_identite").style.display = 'none';
    document.getElementById("numeroidentite_contrat").style.border = '1px solid #dddddd';
    document.getElementById("error-numeroidentite_contrat").style.display = 'none';

}
//------------------------------------Fonction pour le bouton ANNULER------------------------------------
function annulerContrat() {
    //Scroll jusqu'au header
    
    //Vider le formulaire et les champs d'erreur
    videFormulaire();
    // document.getElementById('error-prenomnom').style.display = "none";
    // document.getElementById('error-age').style.display = "none";
    // document.getElementById('error-telephone').style.display = "none";
    // document.getElementById('error-contrat').style.display = "none";
    // document.getElementById('error-abonnement').style.display = "none";
    // document.getElementById('spaniNbErrors').style.display = "none";

    document.getElementById('jv1').scrollIntoView({ behavior: 'smooth' });
    //Cacher le bouton MODIFIER et ANNULER
    document.getElementById('btn_modifier').style.display = "none";
    document.getElementById('btn_confirmer').style.display = "none";
    //Apparaître le bouton AJOUTER
    document.getElementById('btn_ajouter').style.display = "none";
    document.getElementById('btn_annuler').style.display = "none";
    document.getElementById('divretenue').style.display = "none";
    document.getElementById("debutformulaire").style.display= "none";
    document.getElementById("tableau_retour").style.display= "none";
    document.getElementById("tableau_gestion").style.display= "none";
    document.getElementById("champ_obligatoire").style.display = "none";
    document.getElementById("divactif").style.display = "none";
}


//------------------------------------Configuration de la librairie DataTable------------------------------------
const location_gestion_configuration = {
    "stateSave": false,
    "order": [[3, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[5, 10, 15, 20, -1], ["5", "10", "15", "20", "Total"]],
    "language": {
        "info": "Locations _START_ à _END_ sur _TOTAL_ sélectionnés",
        "emptyTable": "Aucune location en cours",
        "lengthMenu": "_MENU_ Location par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "Location 0 à 0 sur 0 sélectionnés",
    },
    "columns": [
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false }
    ],
    'retrieve': true
};

//------------------------------------Quand l'HTML a fini de charger création du tableau avec la librairie DataTable et des différentes div------------------------------------
var table;
$(document).ready(function () {
    gestioncreationtableau();
    loadLocation_gestion();
});

// Ancien scriptretourloc.js
//------------------------------------Tableau general------------------------------------

// Les différentes variables des boutons
var btnajouter = document.getElementById("btnajouter");
var btnmodifier = document.getElementById("btnmodifier");
var btnannuler = document.getElementById("btnannuler");

var aOfLocation_retour= [];

function loadLocation_retour() {
    var datas = {
        page : "location_retour_liste",
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
        var iLocation_retour= 0;
        for (var ligne in result)	{
            aOfLocation_retour[iLocation_retour]= [];
            aOfLocation_retour[iLocation_retour]["id_contrat"]= result[ligne]["id_contrat"];
            aOfLocation_retour[iLocation_retour]["id_modele"]= result[ligne]["id_modele"];
            aOfLocation_retour[iLocation_retour]["nom_modele"]= result[ligne]["nom_modele"];
            aOfLocation_retour[iLocation_retour]["id_type_velo"]= result[ligne]["id_type_velo"];
            aOfLocation_retour[iLocation_retour]["nom_type_velo"]= result[ligne]["nom_type_velo"];
            aOfLocation_retour[iLocation_retour]["id_marque"]= result[ligne]["id_marque"];
            aOfLocation_retour[iLocation_retour]["nom_marque"]= result[ligne]["nom_marque"];
            aOfLocation_retour[iLocation_retour]["id_type_utilisateur"]= result[ligne]["id_type_utilisateur"];
            aOfLocation_retour[iLocation_retour]["id_type_utilisateur"]= result[ligne]["id_type_utilisateur"];
            aOfLocation_retour[iLocation_retour]["id_type_identite"]= result[ligne]["id_type_identite"];
            aOfLocation_retour[iLocation_retour]["id_ville"]= result[ligne]["id_ville"];
            aOfLocation_retour[iLocation_retour]["id_formation"]= result[ligne]["id_formation"];
            aOfLocation_retour[iLocation_retour]["numero_contrat"]= result[ligne]["numero_contrat"];
            aOfLocation_retour[iLocation_retour]["id_velo"]= (result[ligne]["id_velo"]);
            aOfLocation_retour[iLocation_retour]["numeroafpa_velo"]= (result[ligne]["numeroafpa_velo"]);
            aOfLocation_retour[iLocation_retour]["id_utilisateur"]= (result[ligne]["id_utilisateur"]);
            aOfLocation_retour[iLocation_retour]["nom_utilisateur"]= result[ligne]["nom_utilisateur"];
            aOfLocation_retour[iLocation_retour]["prenom_utilisateur"]= result[ligne]["prenom_utilisateur"];
            aOfLocation_retour[iLocation_retour]["tel_utilisateur"]= result[ligne]["tel_utilisateur"];
            aOfLocation_retour[iLocation_retour]["email_utilisateur"]= result[ligne]["email_utilisateur"];
            aOfLocation_retour[iLocation_retour]["adresse_utilisateur"]= result[ligne]["adresse_utilisateur"];
            aOfLocation_retour[iLocation_retour]["codepostal_utilisateur"]= result[ligne]["codepostal_utilisateur"];
            aOfLocation_retour[iLocation_retour]["commentaire_contrat"]= result[ligne]["commentaire_contrat"];
            aOfLocation_retour[iLocation_retour]["datedebut_loc_contrat"]= result[ligne]["datedebut_loc_contrat"];
            aOfLocation_retour[iLocation_retour]["numeroidentite_contrat"]= result[ligne]["numeroidentite_contrat"];
            aOfLocation_retour[iLocation_retour]["datefin_loc_contrat"]= result[ligne]["datefin_loc_contrat"];
            iLocation_retour++;
        }
        // htmlspecialchars_decode
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        creationtableau();
        tables = $('#table_retourloc').DataTable(location_retour_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}
//------------------------------------Tableau choix Location_accessoire------------------------------------
var aOfLocation_retour_accessoire= [];
//------------------------------------Fonction pour la creation de Location_accessoire------------------------------------
    function loadLocation_retour_accessoire()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_retour_accessoire_liste",
            bJSON : 1, 
            id_contrat : $('#id_contrat').val()
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
            aOfLocation_retour_accessoire= result;
            for (var i=0; i<aOfLocation_retour_accessoire.length; i++)  {
                if (aOfLocation_retour_accessoire[i]["id_contrat"] == aOfLocation_retour[iIndiceEditEncours]["id_contrat"])  {
                    $('input[name="id_accessoire"][value="' + aOfLocation_retour_accessoire[i]["id_accessoire"] + '"]').prop('checked', true);
                }
            }
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

//------------------------------------Fonction permettant la création du tableau------------------------------------
function creationtableau() {
    let i;
    //Incrémentation d'HTML a l'ID =" table_retourloc"
    let sHTML = "<thead>";
    sHTML += "<tr>";
    sHTML += "<td>Contrat  <img src=\"image/location/contrat.png\"></td>";
    sHTML += "<td>Vélo <img src=\"image/location/velo.png\"></td>";
    sHTML += "<td>Nom" + "<br>" + "<img src=\"image/location/contact.png\"></td>";
    sHTML += "<td>Téléphone" + "<br>" + "<img src=\"image/location/telephone1.png\"></td>";
    sHTML += "<td>Date début " + "<br>" + "(Année/Mois/Jour) <img src=\"image/location/date_schedule_calendar_icon_262708.png\"></td>";
    sHTML += "<td>Date fin " + "<br>" + "(Année/Mois/Jour) <img src=\"image/location/date_schedule_calendar_icon_262708.png\"></td>";
    sHTML += "<td>Valider retour</td>";
    sHTML += "</tr>";
    sHTML += "</thead>";
    sHTML += "<tbody>";

    // Boucle permettant l'initialisation des tableaux précedemment saisis
    for (i = 0; i < aOfLocation_retour.length; i++) {
        
        sHTML += "<tr>";
        sHTML += "<td>" + aOfLocation_retour[i]["numero_contrat"] + "</td>";
        sHTML += "<td>" + aOfLocation_retour[i]["nom_marque"] + " | " + aOfLocation_retour[i]["nom_modele"] + " | " + aOfLocation_retour[i]["nom_type_velo"] + " | N°" + aOfLocation_retour[i]["numeroafpa_velo"] +  "</td>";
        sHTML += "<td>" + aOfLocation_retour[i]["nom_utilisateur"] + "</td>";
        sHTML += "<td>" + aOfLocation_retour[i]["tel_utilisateur"] + "</td>";
        sHTML += "<td>" + aOfLocation_retour[i]["datedebut_loc_contrat"] + "</td>";
        sHTML += "<td>" + aOfLocation_retour[i]["datefin_loc_contrat"] + "</td>";
        sHTML += `<td><button type="button" class="btn btn-primary retourloc_bg_green" onclick="editContrat_retour(${i})">Retour</button>`;
        sHTML += "</tr>";
    }
    sHTML += "</tbody>";
    $('#table_retourloc').html(sHTML);
}


//------------------------------------Fonction permettant de reconstruire le tableau------------------------------------
function rebuildDatable() {
    $('#table_retourloc').html("");
    //Suppresion du tableau en entier
    tables.clear();
    tables.destroy();
    // Recréaction du tableau avec la librairie DataTable
    creationtableau();
    tables = $('#table_retourloc').DataTable(location_retour_configuration);
}




//------------------------------------Création d'une variable pour garder en mémoire l'index qu'on veut modifier------------------------------------
var iIndiceEditEnCours= -1;


function editContrat_retour(iIndiceEdit)	{
    document.getElementById("liste_utilisateur").style.display= "none";
    document.getElementById("debutformulaire").style.display= "block";
    iIndiceEditEncours = iIndiceEdit;
    videFormulaire();
    // Sélectionner tous les éléments input de type "text"
    var inputs = document.querySelectorAll('input[name="nom_utilisateur"], input[name="prenom_utilisateur"],input[name="adresse_utilisateur"],input[name="numeroidentite_contrat"],input[type="email"],input[type="tel"],input[name="velo_datalist"], input[name="datedebut_loc_contrat"]');

    // Parcourir chaque élément et définir l'attribut readonly
    inputs.forEach(function(input) {
        input.readOnly = true;  // Définit l'attribut readonly
    });
    //Scroll jusqu'au header
    document.getElementById('debutformulaire').scrollIntoView({ behavior: 'smooth' });
	$('#id_contrat').val(aOfLocation_retour[iIndiceEdit]["id_contrat"]);
    $('#id_ville').val(aOfLocation_retour[iIndiceEdit]["id_ville"]);
    $('#id_type_utilisateur').val(aOfLocation_retour[iIndiceEdit]["id_type_utilisateur"]);
    $('#id_formation').val(aOfLocation_retour[iIndiceEdit]["id_formation"]);
    $('#email_utilisateur').val(aOfLocation_retour[iIndiceEdit]["email_utilisateur"]);
    $('#tel_utilisateur').val(aOfLocation_retour[iIndiceEdit]["tel_utilisateur"]);
    $('#adresse_utilisateur').val(aOfLocation_retour[iIndiceEdit]["adresse_utilisateur"]);
    $('#codepostal_utilisateur').val(aOfLocation_retour[iIndiceEdit]["codepostal_utilisateur"]);
	$('#nom_utilisateur').val(aOfLocation_retour[iIndiceEdit]["nom_utilisateur"]);
    $('#prenom_utilisateur').val(aOfLocation_retour[iIndiceEdit]["prenom_utilisateur"]);
    $('#numeroidentite_contrat').val(aOfLocation_retour[iIndiceEdit]["numeroidentite_contrat"]);
    $('#id_type_identite').val(aOfLocation_retour[iIndiceEdit]["id_type_identite"]);
    $("#velo_list_marque option").each(function(i){
        if ($("#velo_list_marque option[value='"+$(this).val()+"']").attr("data-id-velo") == (aOfLocation_retour[iIndiceEdit]["id_velo"])) {
            $('#velo_datalist').val( $(this).val() );
        }
    });
	$('#numeroafpa_velo').val(aOfLocation_retour[iIndiceEdit]["numeroafpa_velo"]);
	$('#datefin_loc_contrat').val(aOfLocation_retour[iIndiceEdit]["datefin_loc_contrat"]);
    $('#datedebut_loc_contrat').val(aOfLocation_retour[iIndiceEdit]["datedebut_loc_contrat"]);
	$('#commentaire_contrat').val(aOfLocation_retour[iIndiceEdit]["commentaire_contrat"]);

    document.getElementById('divretenue').style.display = "block";
    loadLocation_retour_accessoire();	
    //Cacher le bouton MODIFIER et ANNULER
    document.getElementById('btn_ajouter').style.display = "none";
    document.getElementById('btn_modifier').style.display = "none";
    //Apparaître le bouton AJOUTER
    document.getElementById('btn_confirmer').style.display = "inline-block";
    document.getElementById('btn_annuler').style.display = "inline-block";
    document.getElementById("champ_obligatoire").style.display = "block";

}
function ConfirmLocation_contrat()	{
	$('#divModalSaving').show();
    var sRetenue = "";

    $("input[type='radio'][name='retenue_caution']").each(function() {
    if ($(this).is(':checked')) {
        sRetenue = $(this).val();
    }
    });

    if (sRetenue == "partielle") {
        sRetenue = $('#retenuepartielle_caution').val()
    }
	var datas = {
		page : "location_retour_update",
		bJSON : 1, 
        id_contrat: $('#id_contrat').val(),
        datefin_loc_contrat: $('#datefin_loc_contrat').val(),
        retenue_caution: sRetenue,
        commentaire_contrat: $('#commentaire_contrat').val(),
		actif_contrat: 0
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
		if (result[0]["error"] != "")	{
			$('#divModalSaving').hide();
			alert("Erreur lors de l'ajout du retour de location. Vous allez être déconnecté.");
			self.location.href= "route.php?page=location_contrat"
		}  else  {
			var iLongueur= aofLocation_retour.length;
			aofLocation_retour[iLongueur]= [];
			aofLocation_retour[iLongueur]["id_contrat"]= $('#id_contrat').val();
			aofLocation_retour[iLongueur]["datefin_loc_contrat"]= $('#datefin_loc_contrat').val();
            aofLocation_retour[iLongueur]["retenue_caution"]= sRetenue;
            aofLocation_retour[iLongueur]["commentaire_caution"]= $('#commentaire_caution').val();
            aofLocation_retour[iLongueur]["actif_typerep"]= 0 ;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout du retour de location. Vous allez être déconnecté.");
		self.location.href= "route.php?page=location_contrat"
	});
}
//------------------------------------Configuration de la librairie DataTable------------------------------------
const location_retour_configuration = {
    "stateSave": false,
    "order": [[4, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[5, 10, 15, 20, -1], ["5", "10", "15", "20", "Total"]],
    "language": {
        "info": "Location _START_ à _END_ sur _TOTAL_ sélectionnés",
        "emptyTable": "Aucune location en cours",
        "lengthMenu": "_MENU_ Location par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "Location 0 à 0 sur 0 sélectionnés",
    },
    "columns": [
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": true },
        { "orderable": false }
    ],
    'retrieve': true
};
//------------------------------------Quand l'HTML a fini de charger création du tableau avec la librairie DataTable et des différentes div------------------------------------
var tables;
$(document).ready(function () {
    creationtableau();
    loadLocation_retour();
    loadLocation_formation();
    loadLocation_velo();
    loadLocation_verifidentite();
    loadLocation_accessoire();
    loadLocation_utilisateur();
    loadLocation_ville();
    loadLocation_type_utilisateur();
});
// ancien scriptlocation.js
function showTableau(div_name)	{
    // hide all code's divs
    document.getElementById("tableau_retour").style.display= "none";
    document.getElementById("debutformulaire").style.display= "none";
    document.getElementById("tableau_gestion").style.display= "none";
    document.getElementById("liste_utilisateur").style.display = "block";
    // show the one clicked 
    document.getElementById(div_name).style.display= "block";
    if (div_name == "debutformulaire") {
        videFormulaire();
        document.getElementById("btn_modifier").style.display = "none";
        document.getElementById("btn_confirmer").style.display = "none";
        document.getElementById("divretenue").style.display = "none";
        document.getElementById("btn_ajouter").style.display = "inline-block";
        document.getElementById("btn_annuler").style.display = "inline-block";
        document.getElementById("champ_obligatoire").style.display = "block";
    }
    if ((div_name == "tableau_retour") || (div_name == "tableau_gestion")) {
        videFormulaire();
        document.getElementById("btn_modifier").style.display = "none";
        document.getElementById("btn_confirmer").style.display = "none";
        document.getElementById("btn_ajouter").style.display = "none";
        document.getElementById("btn_annuler").style.display = "none";
    }
    // if (div_name == "tableau_gestion") {
    //     videFormulaire();
    //     document.getElementById("btn_modifier").style.display = "inline-block";
    //     document.getElementById("btn_confirmer").style.display = "none";
    //     document.getElementById("btn_ajouter").style.display = "none";
    //     document.getElementById("btn_annuler").style.display = "inline-block";
    // }
}

function showRetenue() {
    var retenuecheck = "";

    $("input[type='radio'][name='retenue_caution']").each(function() {
    if ($(this).is(':checked')) {
        retenuecheck = $(this).val();
    }
    });
    if (retenuecheck == "partielle") {
        document.getElementById("retenuepartielle_caution").style.display = "block";
    } else {
        document.getElementById("retenuepartielle_caution").style.display = "none";

    }
}
//------------------------------------Fonction permettant le contrôle de saisie------------------------------------
function verifierFormulaire() {
    // Initialisation des variables
    var verifutilisateur = document.getElementById("id_utilisateur").value;
    var verifvelo = document.getElementById("velo_datalist").value;
    var verifdatedebut_loc_contrat = document.getElementById("datedebut_loc_contrat").value;
    var verifdatefin_loc_contrat = document.getElementById("datefin_loc_contrat").value;
    var verifid_type_identite = document.getElementById("id_type_identite").value;
    var verifnumeroidentite_contrat = document.getElementById("numeroidentite_contrat").value;

    // Controle de saisie pour l'utilisateur
    if ((verifutilisateur === "") ||(verifutilisateur=== null)) {
        document.getElementById("id_utilisateur").style.border = '2px solid red';
        document.getElementById("error-id_utilisateur").style.display = 'inline';
    } else {
        document.getElementById("id_utilisateur").style.border = '1px solid #dddddd';
        document.getElementById("error-id_utilisateur").style.display = 'none';
    }

    // Controle de saisie pour le vélo
    if ((verifvelo === "") ||(verifvelo === null)) {
        document.getElementById("velo_datalist").style.border = '2px solid red';
        document.getElementById("error-velo_datalist").style.display = 'inline';
        
    } else {
        document.getElementById("velo_datalist").style.border = '1px solid #dddddd';
        document.getElementById("error-velo_datalist").style.display = 'none';
    }

    // Controle de saisie pour la datedebut_loc_contrat
    if ((verifdatedebut_loc_contrat === "") ||(verifdatedebut_loc_contrat === null)) {
        document.getElementById("datedebut_loc_contrat").style.border = '2px solid red';
        document.getElementById("error-datedebut_loc_contrat").style.display = 'inline';
        
    } else {
        document.getElementById("datedebut_loc_contrat").style.border = '1px solid #dddddd';
        document.getElementById("error-datedebut_loc_contrat").style.display = 'none';
    }

    // Controle de saisie pour la datefin_loc_contrat
    if ((verifdatefin_loc_contrat === "") ||(verifdatefin_loc_contrat === null)) {
        document.getElementById("datefin_loc_contrat").style.border = '2px solid red';
        document.getElementById("error-datefin_loc_contrat").style.display = 'inline';
        
    } else {
        document.getElementById("datefin_loc_contrat").style.border = '1px solid #dddddd';
        document.getElementById("error-datefin_loc_contrat").style.display = 'none';
    }

     // Controle de saisie pour l'id_type_identite
     if ((verifid_type_identite === "") ||(verifid_type_identite === null)) {
        document.getElementById("id_type_identite").style.border = '2px solid red';
        document.getElementById("error-id_type_identite").style.display = 'inline';
        
    } else {
        document.getElementById("id_type_identite").style.border = '1px solid #dddddd';
        document.getElementById("error-id_type_identite").style.display = 'none';
    }
    
    // Controle de saisie pour le numeroidentite_contrat
    if ((verifnumeroidentite_contrat === "") ||(verifnumeroidentite_contrat === null)) {
        document.getElementById("numeroidentite_contrat").style.border = '2px solid red';
        document.getElementById("error-numeroidentite_contrat").style.display = 'inline';
        
    } else {
        document.getElementById("numeroidentite_contrat").style.border = '1px solid #dddddd';
        document.getElementById("error-numeroidentite_contrat").style.display = 'none';
    }

    // // Controle de saisie pour l'abonnement
    // if (verifabonnement === null || verifabonnement === "") {
    // document.getElementById("divabonnement").style.border = '1px solid red';
    // document.getElementById("error-abonnement").style.display = 'inline';
    // 
    // } else {
    //     document.getElementById("divabonnement").style.border = '1px solid rgb(105, 160, 17)';
    //     document.getElementById("error-abonnement").style.display = 'none';
    // }

    // // Controle de saisie pour la date de contrat
    // var contratDate = new Date(verifcontrat);
    // var minDate = new Date("2024-07-01");
    // var maxDate = new Date("2027-01-01");

    // if (contratDate < minDate || contratDate > maxDate || verifcontrat == "") {
    //     document.getElementById("contrat").style.border = '1px solid red';
    //     document.getElementById("error-contrat").style.display = 'inline';
    //     iNbErrors++;
    // } else {
    //     document.getElementById("contrat").style.border = '1px solid rgb(105, 160, 17)';
    //     document.getElementById("error-contrat").style.display = 'none';
    // }

}

function ajoutLocation_contrat()	{
	$('#divModalSaving').show();

    var aOfAccessoires= [];
    $("input[type='checkbox'][id='id_accessoire']").each(function(){
        if ($(this).prop('checked') == true)    {
            aOfAccessoires.push($(this).val());
        }
    });

	var datas = {
		page : "location_contrat_save",
		bJSON : 1, 
		id_velo: $("#velo_list_marque option[value='"+$('#velo_datalist').val()+"']").attr("data-id-velo") ,
		id_utilisateur: $('#id_utilisateur').val(),
		id_type_identite: $('#id_type_identite').val(),
		datedebut_loc_contrat:$('#datedebut_loc_contrat').val(),
		datefin_loc_contrat:$('#datefin_loc_contrat').val(),
		commentaire_contrat: $('#commentaire_contrat').val(),
		numeroidentite_contrat: $('#numeroidentite_contrat').val(),
        sListeAccessoires: aOfAccessoires.join("|")
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
		if (result[0]["error"] != "")	{
			$('#divModalSaving').hide();
			alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
			// self.location.href= "route.php?page=gestion_client"
		}  else  {
            if (result[0]["errorsaisie"] != "")  { // Si la chaîne "errorsaisie" n'est pas vide (c'est-à-dire qu'il y a des erreurs)
                // Parcourt chaque élément <select>, <textarea> et <input> sur la page
                $("select, textarea, input").each(function () {
                    // Réinitialise les bordures de chaque élément (change la bordure en gris clair, "#dddddd")
                    $('#'+ $(this).attr("id")).css("border", "1px solid #dddddd");
                    // Cache tout élément qui a un message d'erreur associé (en supposant que les erreurs soient affichées dans des éléments
                    // avec un identifiant qui commence par 'error_' suivi de l'ID du champ)
                    $('#error_'+ $(this).attr("id")).css("display", "none");
                    // Supprime spécifiquement la bordure de l'élément avec l'ID 'id_accessoire' (si présent), pour un cas particulier.
                    $('#id_accessoire').css("border", "none");
                });
                // console.log(result[0]["errorsaisie"]);
                // Divise la chaîne d'erreurs (séparée par des " | ") en un tableau de noms de champs
                var aOfError = result[0]["errorsaisie"].split("|");
                // Parcourt chaque élément du tableau d'erreurs
                for (var iError=0; iError<aOfError.length; iError++) {
                    // Applique une bordure rouge de 2 pixels aux champs qui contiennent des erreurs
                    $('#' + aOfError[iError]).css("border","2px solid red");
                    // Affiche le message d'erreur associé à chaque champ erroné
                    $('#error_' + aOfError[iError]).css("display", "block");
                     // Si c'est la première erreur rencontrée (iError == 0), fait défiler la page pour afficher ce champ en haut
                    if (iError == 0) {
                        $('html, body').animate({scrollTop: $("#" + aOfError[iError]).offset().top-50}, 800);
                    }
                }
                // Appelle la fonction 'verifierFormulaire()' qui est utilisée pour une vérification finale du formulaire
                verifierFormulaire();
            } else {
                var iLongueur= aOfLocation_contrat.length;
                aOfLocation_contrat[iLongueur]= [];
                aOfLocation_contrat[iLongueur]["id_contrat"]= result[0]["id_contrat"];
                aOfLocation_contrat[iLongueur]["id_velo"]= $("#velo_list_marque option[value='"+$('#velo_datalist').val()+"']").attr("data-id-velo") ;
                aOfLocation_contrat[iLongueur]["id_utilisateur"]= $('#id_utilisateur').val();
                aOfLocation_contrat[iLongueur]["id_type_identite"]= $('#id_type_identite').val();
                aOfLocation_contrat[iLongueur]["numeroidentite_contrat"]= $('#numeroidentite_contrat').val();
                aOfLocation_contrat[iLongueur]["commentaire_contrat"]= $('#commentaire_contrat').val();
                aOfLocation_contrat[iLongueur]["datedebut_loc_contrat"]= $('#datedebut_loc_contrat').val();
                aOfLocation_contrat[iLongueur]["datefin_loc_contrat"]= $('#datefin_loc_contrat').val();
                $('#divModalSaving').hide();
                videFormulaire();
                document.getElementById('debutformulaire').scrollIntoView({ behavior: 'smooth' });
            }
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		// self.location.href= "route.php?page=gestion_client"
	});
}

function supprimContrat(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprcontrat = aOfLocation_gestion[iIndiceSuppr]["nom_utilisateur"];
        $('#supprcontrat').html(Supprcontrat);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "location_gestion_delete",
        bJSON : 1, 
        id_contrat: aOfLocation_gestion[iIndiceSuppr]["id_contrat"]
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
        if (result[0]["error"] != "")	{
            $('#divModalSaving').hide();
            alert("Erreur lors de la suppression de votre contrat. Vous allez être déconnecté.");
            self.location.href= "route.php?page=location_contrat"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfLocation_gestion.length-1); i++)	{
                aOfLocation_gestion[i]= aOfLocation_gestion[i+1];
            }
            aOfLocation_gestion.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre contrat. Vous allez être déconnecté.");
        self.location.href= "route.php?page=location_contrat"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}
//------------------------------------Tableau choix Location_utilisateur------------------------------------
var aOfLocation_utilisateur= [];
//------------------------------------Fonction pour la creation de Location_utilisateur------------------------------------
function choixLocation_utilisateur() {
    var schoixLocation_utilisateur = "<option selected id='id_utilisateur' name='id_utilisateur' class=\"fw-bold\" value=\"\">--Utilisateur--</option>"
    for (var i = 0; i < aOfLocation_utilisateur.length; i++) {
        if ((aOfLocation_utilisateur[i]["actif_utilisateur"] == 0) || (aOfLocation_utilisateur[i]["id_type_utilisateur"] == 1) ) {
            schoixLocation_utilisateur += "";
        } else {
            schoixLocation_utilisateur += "<option id='id_utilisateur' name='id_utilisateur' value='" + aOfLocation_utilisateur[i]["id_utilisateur"] + "'>" + aOfLocation_utilisateur[i]["prenom_utilisateur"] + " " + aOfLocation_utilisateur[i]["nom_utilisateur"] + "</option>";
        }
    }
    $('#id_utilisateur').html(schoixLocation_utilisateur);
}
    function loadLocation_utilisateur()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_utilisateur_liste",
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
            aOfLocation_utilisateur= result;
            choixLocation_utilisateur();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}
//------------------------------------Tableau choix Location_ville------------------------------------
var aOfLocation_ville= [];
//------------------------------------Fonction pour la creation de Location_ville------------------------------------
function choixLocation_ville() {
    var schoixLocation_ville = "<option disabled selected class=\"fw-bold\" value=\"\">--Ville--</option>"
    for (var i = 0; i < aOfLocation_ville.length; i++) {
        schoixLocation_ville += "<option id='id_ville' name='id_ville' value='" + aOfLocation_ville[i]["id_ville"] + "'>" + aOfLocation_ville[i]["nom_ville"] + "</option>";
    }
    $('#id_ville').html(schoixLocation_ville);
}
    function loadLocation_ville()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_ville_liste",
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
            aOfLocation_ville= result;
            choixLocation_ville();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

//------------------------------------Tableau choix Location_formation------------------------------------
var aOfLocation_formation= [];
//------------------------------------Fonction pour la creation de Location_formation------------------------------------
function choixLocation_formation() {
    var schoixLocation_formation = "<option disabled selected class=\"fw-bold\" value=\"\">--Formation--</option>"
    for (var i = 0; i < aOfLocation_formation.length; i++) {
        schoixLocation_formation += "<option id='id_formation' name='id_formation' value='" + aOfLocation_formation[i]["id_formation"] + "'>" + aOfLocation_formation[i]["nom_formation"] + "</option>";
    }
    $('#id_formation').html(schoixLocation_formation);
}
    function loadLocation_formation()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_formation_liste",
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
            aOfLocation_formation= result;
            choixLocation_formation();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

//------------------------------------Tableau choix Location_type_utilisateur------------------------------------
var aOfLocation_type_utilisateur= [];
//------------------------------------Fonction pour la creation de Location_type_utilisateur------------------------------------
function choixLocation_type_utilisateur() {
    var schoixLocation_type_utilisateur = "<option disabled selected class=\"fw-bold\" value=\"\">--Type_utilisateur--</option>"
    for (var i = 0; i < aOfLocation_type_utilisateur.length; i++) {
        if (aOfLocation_type_utilisateur[i]["id_type_utilisateur"] != 1){
            schoixLocation_type_utilisateur += "<option id='id_type_utilisateur' name='id_type_utilisateur' value='" + aOfLocation_type_utilisateur[i]["id_type_utilisateur"] + "'>" + aOfLocation_type_utilisateur[i]["nom_type_utilisateur"] + "</option>";
        } else {
            schoixLocation_type_utilisateur += ""
        }
    }
    $('#id_type_utilisateur').html(schoixLocation_type_utilisateur);
}
    function loadLocation_type_utilisateur()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_type_utilisateur_liste",
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
            aOfLocation_type_utilisateur= result;
            choixLocation_type_utilisateur();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}
//------------------------------------Tableau choix Location_velo------------------------------------
var aOfLocation_velo= [];
//------------------------------------Fonction pour la creation de Location_velo------------------------------------
function choixLocation_velo() {                              
    var schoixLocation_velo = ""
    schoixLocation_velo += "<option value=\"\" data-id-velo=\"\" disabled></option> ";
    for (var i = 0; i < aOfLocation_velo.length; i++) {
        if ((aOfLocation_velo[i]["actif_velo"] == 0) || (aOfLocation_velo[i]["etat_velo"] != "ok") ) {
            schoixLocation_velo += "";
        } else {
            schoixLocation_velo += "<option value=\"" + aOfLocation_velo[i]["nom_marque"] + " | " +  aOfLocation_velo[i]["nom_modele"] + " | " +  aOfLocation_velo[i]["nom_type_velo"] + " | " + "N°" +  aOfLocation_velo[i]["numeroafpa_velo"] + "\" data-id-velo=\"" + aOfLocation_velo[i]["id_velo"] + "\"></option>";
        }

    }
    $('#velo_list_marque').html(schoixLocation_velo);
}
    function loadLocation_velo()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_velo_liste",
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
            aOfLocation_velo= result;
            choixLocation_velo();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

//------------------------------------Tableau choix Location_verifidentite------------------------------------
var aOfLocation_verifidentite= [];
//------------------------------------Fonction pour la creation de Location_verifidentite------------------------------------
function choixLocation_verifidentite() {

    var schoixLocation_verifidentite = "<option disabled selected class=\"fw-bold\" value=\"\">--Type de document--</option>"
    for (var i = 0; i < aOfLocation_verifidentite.length; i++) {
        schoixLocation_verifidentite += "<option id='id_type_identite' name='id_type_identite' value='" + aOfLocation_verifidentite[i]["id_type_identite"] + "'>" + aOfLocation_verifidentite[i]["nom_type_identite"] + "</option>";
    }
    $('#id_type_identite').html(schoixLocation_verifidentite);
}
    function loadLocation_verifidentite()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_verifidentite_liste",
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
            aOfLocation_verifidentite= result;
            choixLocation_verifidentite();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}
//------------------------------------Tableau choix Location_accessoire------------------------------------
var aOfLocation_accessoire= [];
//------------------------------------Fonction pour la creation de Location_accessoire------------------------------------
function choixLocation_accessoire() {
    var schoixLocation_accessoire = ""
    for (var i = 0; i < aOfLocation_accessoire.length; i++) {
        schoixLocation_accessoire+= "<tr>";
        if ((aOfLocation_accessoire[i]["actif_accessoire"] == "1") && ((aOfLocation_accessoire[i]["etat_accessoire"] == "ok") || (aOfLocation_accessoire[i]["etat_accessoire"] == ""))) {
        if ((aOfLocation_accessoire[i]["taille_accessoire"] == "") && (aOfLocation_accessoire[i]["particularite_accessoire"]== "")) {
            schoixLocation_accessoire+= "<td><input type=\"checkbox\" id=\"id_accessoire\" name=\"id_accessoire\" value=\"" + aOfLocation_accessoire[i]["id_accessoire"] + "\" /></td>";
            schoixLocation_accessoire+= "<td><label>" + aOfLocation_accessoire[i]["nom_accessoire"] + "</label></td>";
        }
        else {
            schoixLocation_accessoire+= "<td><input type=\"checkbox\" id=\"id_accessoire\" name=\"id_accessoire\" value=\"" + aOfLocation_accessoire[i]["id_accessoire"] + "\" /></td>";
            schoixLocation_accessoire+= "<td><label>" + aOfLocation_accessoire[i]["nom_accessoire"] + " (" + aOfLocation_accessoire[i]["taille_accessoire"] + aOfLocation_accessoire[i]["particularite_accessoire"] + ")" + "</label></td>";
        }
        } else {
            schoixLocation_accessoire += ""
        }
        schoixLocation_accessoire+= "</tr>"; 
    }
    $('#id_accessoire').html(schoixLocation_accessoire);
}
    function loadLocation_accessoire()	{
        $('#divModalSaving').show();
        var datas = {
            page : "location_accessoire_liste",
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
            aOfLocation_accessoire= result;
            choixLocation_accessoire();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}


function remplirFormulaire() {
    var Utilisateur = ($("#id_utilisateur").val()- 1) ;
    
    // Sélectionner tous les éléments input de type "text"
    var inputs = document.querySelectorAll('input[name="nom_utilisateur"], input[name="prenom_utilisateur"], input[name="email_utilisateur"],input[name="tel_utilisateur"],input[name="adresse_utilisateur"],input[name="codepostal_utilisateur"]');
    var select = document.querySelectorAll('select[name="id_type_utilisateur"],select[name="id_formation"]');

    // Parcourir chaque élément et définir l'attribut readonly
    inputs.forEach(function(input) {
        input.readOnly = true;  // Définit l'attribut readonly
    });
    select.forEach(function(select) {
        select.disabled = true;  // Définit l'attribut readonly
    });
 

    if ((($("#id_utilisateur").val()) != "") || (($("#id_utilisateur").val()) == null)) {
        $("#nom_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["nom_utilisateur"]);
        $("#prenom_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["prenom_utilisateur"]);
        $("#email_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["email_utilisateur"]);
        $("#tel_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["tel_utilisateur"]);
        $("#id_type_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["id_type_utilisateur"]);
        $("#id_formation").val(aOfLocation_utilisateur[Utilisateur]["id_formation"]);
        $("#adresse_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["adresse_utilisateur"]);
        $("#id_ville").val(aOfLocation_utilisateur[Utilisateur]["id_ville"]);
        $("#codepostal_utilisateur").val(aOfLocation_utilisateur[Utilisateur]["codepostal_utilisateur"]);
        if ($("#id_type_utilisateur").val() == "3") {
            document.getElementById("formation").style.display = "none";
        }
        else {
            document.getElementById("formation").style.display = "block";
        }
    } else {
        videFormulaire();
    }
}

var canvas = document.getElementById("loc_signature_client");

       function resizeCanvas() {
           var ratio = Math.max(window.devicePixelRatio || 1, 1);
           canvas.width = canvas.offsetWidth * ratio;
           canvas.height = canvas.offsetHeight * ratio;
           canvas.getContext("2d").scale(ratio, ratio);
       }
       window.onresize = resizeCanvas;
       resizeCanvas();

       var signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(250,250,250)'
       });

       document.getElementById("loc_clear_client").addEventListener('click', function(){
        signaturePad.clear();
       })

var canvas = document.getElementById("loc_signature_tech");

function resizeCanvas() {
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}
window.onresize = resizeCanvas;
resizeCanvas();

var signaturePad1 = new SignaturePad(canvas, {
backgroundColor: 'rgb(250,250,250)'
});

document.getElementById("loc_clear_tech").addEventListener('click', function(){
signaturePad1.clear();
})

