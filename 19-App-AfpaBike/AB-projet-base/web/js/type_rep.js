 var aOfType_rep = [];

function loadType_rep()	{
    $('#divModalSaving').show();
    var datas = {
        page : "type_rep_liste",
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
        var itype_rep= 0;
        for (var ligne in result)	{
            aOfType_rep[itype_rep]= [];
            aOfType_rep[itype_rep]["id_typerep"]= result[ligne]["id_typerep"];
            aOfType_rep[itype_rep]["nom_typerep"]= result[ligne]["nom_typerep"];
            aOfType_rep[itype_rep]["duree_typerep"]= result[ligne]["duree_typerep"];
            aOfType_rep[itype_rep]["actif_typerep"]= result[ligne]["actif_typerep"];
            itype_rep++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_type_rep();
        tables = $('#table_type_rep').DataTable(type_rep_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_type_rep() {
    var i;
    var sHTML = "<thead>";
    sHTML += "<tr>";
    sHTML += "<th>ID</th>";
    sHTML += "<th>NOM</th>";
    sHTML += "<th>DUREE</th>";
    sHTML += "<th>ACTIF</th>";
    sHTML += "<th>Action</th>";
    sHTML += "</tr>";
    sHTML += "</thead>";
    sHTML += "<tbody>";

    // Boucle sur le tableau pour créer les lignes du tableau
    for (var i = 0; i < aOfType_rep.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"type_rep\">" + aOfType_rep[i]["id_typerep"] + "</td>";  // type_rep
        sHTML += "<td name=\"type_rep\">" + aOfType_rep[i]["nom_typerep"] + "</td>";  // type_rep
        sHTML += "<td name=\"type_rep\">" + aOfType_rep[i]["duree_typerep"] + "</td>";  // type_rep
        sHTML += "<td name=\"type_rep\">" + aOfType_rep[i]["actif_typerep"] + "</td>";  // type_rep
        sHTML += `<td >
                    <button onClick=\"editType_rep(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimType_rep(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_type_rep').html(sHTML);
}

function ajoutType_rep()	{
	$('#divModalSaving').show();
    let ficheactive ="0";
    if ($('input[name="actif_typerep"]:checked').val()) {
        ficheactive = 1
     }
     else  {
        ficheactive = 0
     }

	var datas = {
		page : "type_rep_save",
		bJSON : 1, 
		nom_typerep: $('#nom_typerep').val(),
        duree_typerep: $('#duree_typerep').val(),
		actif_typerep: ficheactive
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
			var iLongueur= aOfType_rep.length;
			aOfType_rep[iLongueur]= [];
			aOfType_rep[iLongueur]["id_typerep"]= result[0]["id_typerep"];
			aOfType_rep[iLongueur]["nom_typerep"]= $('#nom_typerep').val();
            aOfType_rep[iLongueur]["duree_typerep"]= $('#duree_typerep').val();
            aOfType_rep[iLongueur]["actif_typerep"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function modifType_rep()	{
	$('#divModalSaving').show();
    ficheactive = "0";
    if ($('input[name="actif_typerep"]:checked').val()) {
        ficheactive = 1
     }
     else  {
        ficheactive = 0
     }
	var datas = {
		page : "type_rep_update",
		bJSON : 1, 
        id_typerep: $('#id_typerep').val(),
		nom_typerep: $('#nom_typerep').val(),
        duree_typerep: $('#duree_typerep').val(),
		actif_typerep: ficheactive
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
			var iLongueur= aOfType_rep.length;
			aOfType_rep[iLongueur]= [];
			aOfType_rep[iLongueur]["id_typerep"]= $('#id_typerep').val();
			aOfType_rep[iLongueur]["nom_typerep"]= $('#nom_typerep').val();
            aOfType_rep[iLongueur]["duree_typerep"]= $('#duree_typerep').val();
            aOfType_rep[iLongueur]["actif_typerep"]= ficheactive ;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimType_rep(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprtype_rep = aOfType_rep[iIndiceSuppr]["nom_typerep"];
        $('#supprtype_rep').html(Supprtype_rep);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "type_rep_delete",
        bJSON : 1, 
        id_typerep: aOfType_rep[iIndiceSuppr]["id_typerep"]
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
            alert("Erreur lors de la suppression de votre type_rep. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfType_rep.length-1); i++)	{
                aOfType_rep[i]= aOfType_rep[i+1];
            }
            aOfType_rep.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre type_rep. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function rebuildDatable() {
    $('#table_type_rep').html("");

        tables.clear();
        tables.destroy();
    
    constructTable_type_rep();
    tables = $('#table_type_rep').DataTable(type_rep_configuration);
}


function videFormulaire() {
    $('#id_typerep').val("");
    $('#nom_typerep').val("");
    $('#duree_typerep').val("");
    $('#actif_typerep').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("type_rep_valide");
    var btnModifier = document.getElementById("type_rep_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editType_rep(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfType_rep[i]["actif_typerep"] == "1") {
        $("#actif_typerep").prop('checked', true)
    }
    else{
        $("#actif_typerep").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_typerep').val(aOfType_rep[i]["id_typerep"]);
    $('#nom_typerep').val(aOfType_rep[i]["nom_typerep"]);
    $('#duree_typerep').val(aOfType_rep[i]["duree_typerep"]);
    $('#actif_typerep').val(aOfType_rep[i]["actif_typerep"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("type_rep_valide");
    var btnModifier = document.getElementById("type_rep_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


const type_rep_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ type_rep par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "type_rep 0 à 0 sur 0 sélectionnée",
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
            "orderable": false
        }
    ],
    'retrieve': true
};
var tables;
$(document).ready(function () {
    
    loadType_rep();
    rebuildDatable();
    constructTable_type_rep();
    tables = $('#table_type_rep').DataTable(type_rep_configuration);

});