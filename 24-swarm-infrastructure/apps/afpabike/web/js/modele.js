 var aOfModele = [];

function loadModele()	{
    $('#divModalSaving').show();
    var datas = {
        page : "modele_liste",
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
        var imodele= 0;
        for (var ligne in result)	{
            aOfModele[imodele]= [];
            aOfModele[imodele]["id_modele"]= result[ligne]["id_modele"];
            aOfModele[imodele]["id_type_velo"]= result[ligne]["id_type_velo"];
            aOfModele[imodele]["id_marque"]= result[ligne]["id_marque"];
            aOfModele[imodele]["nom_modele"]= result[ligne]["nom_modele"];
            aOfModele[imodele]["actif_modele"]= result[ligne]["actif_modele"];
            imodele++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables_modeles.page.len(10).draw();
        constructTable_modele();
        tables_modeles = $('#table_modele').DataTable(modele_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

//------------------------------------Tableau choix Modele_type_velo------------------------------------
var aOfModele_type_velo= [];
//------------------------------------Fonction pour la creation de Modele_type_velo------------------------------------
function choixModele_type_velo() {
    var schoixModele_type_velo = "<option disabled selected class=\"fw-bold\" value=\"\">--Type_velo--</option>"
    for (var i = 0; i < aOfModele_type_velo.length; i++) {
        schoixModele_type_velo += "<option id='id_type_velo' name='id_type_velo' value='" + aOfModele_type_velo[i]["id_type_velo"] + "'>" + aOfModele_type_velo[i]["nom_type_velo"] + "</option>";
    }
    $('#id_type_velo').html(schoixModele_type_velo);
}
    function loadModele_type_velo()	{
        $('#divModalSaving').show();
        var datas = {
            page : "modele_type_velo_liste",
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
            aOfModele_type_velo= result;
            choixModele_type_velo();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

//------------------------------------Tableau choix Modele_marque------------------------------------
var aOfModele_marque= [];
//------------------------------------Fonction pour la creation de Modele_marque------------------------------------
function choixModele_marque() {
    var schoixModele_marque = "<option disabled selected class=\"fw-bold\" value=\"\">--Marque--</option>"
    for (var i = 0; i < aOfModele_marque.length; i++) {
        schoixModele_marque += "<option id='id_marque' name='id_marque' value='" + aOfModele_marque[i]["id_marque"] + "'>" + aOfModele_marque[i]["nom_marque"] + "</option>";
    }
    $('#id_marque').html(schoixModele_marque);
}
    function loadModele_marque()	{
        $('#divModalSaving').show();
        var datas = {
            page : "modele_marque_liste",
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
            aOfModele_marque= result;
            choixModele_marque();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

function constructTable_modele() {
    var i;
    var sHTML = "<thead>";
    sHTML += "<tr>";
    sHTML += "<th>ID Modele</th>";
    sHTML += "<th>ID Type_velo</th>";
    sHTML += "<th>ID Marque</th>";
    sHTML += "<th>NOM</th>";
    sHTML += "<th>ACTIF</th>";
    sHTML += "<th>Action</th>";
    sHTML += "</tr>";
    sHTML += "</thead>";
    sHTML += "<tbody>";

    // Boucle sur le tableau pour créer les lignes du tableau
    for (var i = 0; i < aOfModele.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"modele\">" + aOfModele[i]["id_modele"] + "</td>";  // modele
        sHTML += "<td name=\"modele\">" + aOfModele[i]["id_type_velo"] + "</td>";  // modele
        sHTML += "<td name=\"modele\">" + aOfModele[i]["id_marque"] + "</td>";  // modele
        sHTML += "<td name=\"modele\">" + aOfModele[i]["nom_modele"] + "</td>";  // modele
        sHTML += "<td name=\"modele\">" + aOfModele[i]["actif_modele"] + "</td>";  // modele
        sHTML += `<td >
                    <button onClick=\"editModele(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimModele(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_modele').html(sHTML);
}


function ajoutModele()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_modele"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "modele_save",
		bJSON : 1, 
		nom_modele: $('#nom_modele').val(),
		actif_modele: ficheactive,
        id_type_velo: $('#id_type_velo').val(),
        id_marque: $('#id_marque').val()
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
			self.location.href= "route.php?page=gestion_client"
		}  else  {
			var iLongueur= aOfModele.length;
			aOfModele[iLongueur]= [];
			aOfModele[iLongueur]["id_modele"]= result[0]["id_modele"];
			aOfModele[iLongueur]["nom_modele"]= $('#nom_modele').val();
            aOfModele[iLongueur]["actif_modele"]= ficheactive;
            aOfModele[iLongueur]["id_type_velo"]= $('#id_type_velo').val();
            aOfModele[iLongueur]["id_marque"]= $('#id_marque').val();
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
    rebuildDatable();
    $("#exampleModal").style.display = "none";
    Fermeturemodal();
}


function rebuildDatable() {
    
    $('#table_modele').html("");

        tables_modeles.clear();
        tables_modeles.destroy();
    
    constructTable_modele();
    tables_modeles = $('#table_modele').DataTable(modele_configuration);
}


function videFormulaire() {
    $('#id_modele').val("");
    $('#nom_modele').val("");
    $('#actif_modele').prop('checked', false);
    $('#id_marque').val("")
    $('#id_type_velo').val("")

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("modele_valide");
    var btnModifier = document.getElementById("modele_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}

function modifModele()	{
	$('#divModalSaving').show();
    let ficheactive ="0"
    if ($('input[name="actif_modele"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "modele_update",
		bJSON : 1, 
        id_modele: $('#id_modele').val(),
        id_type_velo: $('#id_type_velo').val(),
        id_marque: $('#id_marque').val(),
		nom_modele: $('#nom_modele').val(),
		actif_modele: ficheactive
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
			self.location.href= "route.php?page=gestion_client"
		}  else  {
			var iLongueur= aOfmodele.length;
			aOfmodele[iLongueur]= [];
			aOfmodele[iLongueur]["id_modele"]= $('#id_modele').val();
			aOfmodele[iLongueur]["nom_modele"]= $('#nom_modele').val();
            aOfmodele[iLongueur]["actif_modele"]= ficheactive ;
            aOfmodele[iLongueur]["id_type_velo"]= $('#id_type_velo').val();
            aOfmodele[iLongueur]["id_marque"]= $('#id_marque').val();
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimModele(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprmodele = aOfModele[iIndiceSuppr]["nom_modele"];
        $('#supprmodele').html(Supprmodele);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "modele_delete",
        bJSON : 1, 
        id_modele: aOfModele[iIndiceSuppr]["id_modele"]
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
            alert("Erreur lors de la suppression de votre modele. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfModele.length-1); i++)	{
                aOfModele[i]= aOfModele[i+1];
            }
            aOfModele.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre marque. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

var currentIndex = -1;

function editModele(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;
    if (aOfModele[i]["actif_modele"] == "1") {
        $("#actif_modele").prop('checked', true)
    }
    else{
        $("#actif_modele").prop('checked', false)
    }
    // Remplir le formulaire avec les valeurs du vélo sélectionné

    $('#id_modele').val(aOfModele[i]["id_modele"]);
    $('#nom_modele').val(aOfModele[i]["nom_modele"]);
    $('#actif_modele').val(aOfModele[i]["actif_modele"]);
    $('#id_marque').val(aOfModele[i]["id_marque"]);
    $('#id_type_velo').val(aOfModele[i]["id_type_velo"]);

    // Initialiser les boutons
    var btnAjouter = document.getElementById("modele_valide");
    var btnModifier = document.getElementById("modele_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}

var modele_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ modele par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "modele 0 à 0 sur 0 sélectionnée",
    },
    "columns": [
        {
            "orderable": true
        },
        {
            "orderable": true
        },
        {
            "orderable": true
        },
        {
            "orderable": true
        },
        {
            "orderable": true
        },
        {
            "orderable": false
        }
    ],
    'retrieve': true
};
var tables_modeles;
$(document).ready(function () {
    
    loadModele();
    loadModele_type_velo();
    loadModele_marque();
    constructTable_modele();
    tables_modeles = $('#table_modele').DataTable(modele_configuration);

});