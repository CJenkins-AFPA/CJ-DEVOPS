 var aOfType_velo = [];

function loadType_velo()	{
    $('#divModalSaving').show();
    var datas = {
        page : "type_velo_liste",
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
        var itype_velo= 0;
        for (var ligne in result)	{
            aOfType_velo[itype_velo]= [];
            aOfType_velo[itype_velo]["id_type_velo"]= result[ligne]["id_type_velo"];
            aOfType_velo[itype_velo]["nom_type_velo"]= result[ligne]["nom_type_velo"];
            aOfType_velo[itype_velo]["actif_type_velo"]= result[ligne]["actif_type_velo"];
            itype_velo++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_type_velo();
        tables = $('#table_type_velo').DataTable(type_velo_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_type_velo() {
    var i;
    var sHTML = "<thead>";
    sHTML += "<tr>";
    sHTML += "<th>ID</th>";
    sHTML += "<th>NOM</th>";
    sHTML += "<th>ACTIF</th>";
    sHTML += "<th>Action</th>";
    sHTML += "</tr>";
    sHTML += "</thead>";
    sHTML += "<tbody>";

    // Boucle sur le tableau pour créer les lignes du tableau
    for (var i = 0; i < aOfType_velo.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"type_velo\">" + aOfType_velo[i]["id_type_velo"] + "</td>";  // type_velo
        sHTML += "<td name=\"type_velo\">" + aOfType_velo[i]["nom_type_velo"] + "</td>";  // type_velo
        sHTML += "<td name=\"type_velo\">" + aOfType_velo[i]["actif_type_velo"] + "</td>";  // type_velo
        sHTML += `<td >
                    <button onClick=\"editType_velo(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimType_velo(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_type_velo').html(sHTML);
}

function ajoutType_velo()	{
	$('#divModalSaving').show();
    let ficheactive ="0"
    if ($('input[name="actif_type_velo"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "type_velo_save",
		bJSON : 1, 
		nom_type_velo: $('#nom_type_velo').val(),
		actif_type_velo: ficheactive
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
			var iLongueur= aOfType_velo.length;
			aOfType_velo[iLongueur]= [];
			aOfType_velo[iLongueur]["id_type_velo"]= result[0]["id_type_velo"];
			aOfType_velo[iLongueur]["nom_type_velo"]= $('#nom_type_velo').val();
            aOfType_velo[iLongueur]["actif_type_velo"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function modifType_velo()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_type_velo"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }
	var datas = {
		page : "type_velo_update",
		bJSON : 1, 
        id_type_velo: $('#id_type_velo').val(),
		nom_type_velo: $('#nom_type_velo').val(),
		actif_type_velo: ficheactive
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
			var iLongueur= aOfType_velo.length;
			aOfType_velo[iLongueur]= [];
			aOfType_velo[iLongueur]["id_type_velo"]= $('#id_type_velo').val();
			aOfType_velo[iLongueur]["nom_type_velo"]= $('#nom_type_velo').val();
            aOfType_velo[iLongueur]["actif_type_velo"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimType_velo(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprtype_velo = aOfType_velo[iIndiceSuppr]["nom_type_velo"];
        $('#supprtype_velo').html(Supprtype_velo);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "type_velo_delete",
        bJSON : 1, 
        id_type_velo: aOfType_velo[iIndiceSuppr]["id_type_velo"]
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
            alert("Erreur lors de la suppression de votre type_velo. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfType_velo.length-1); i++)	{
                aOfType_velo[i]= aOfType_velo[i+1];
            }
            aOfType_velo.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre type_velo. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function rebuildDatable() {
    $('#table_type_velo').html("");

        tables.clear();
        tables.destroy();
    
    constructTable_type_velo();
    tables = $('#table_type_velo').DataTable(type_velo_configuration);
}


function videFormulaire() {
    $('#id_type_velo').val("");
    $('#nom_type_velo').val("");
    $('#actif_type_velo').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("type_velo_valide");
    var btnModifier = document.getElementById("type_velo_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editType_velo(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfType_velo[i]["actif_type_velo"] == "1") {
        $("#actif_type_velo").prop('checked', true)
    }
    else{
        $("#actif_type_velo").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_type_velo').val(aOfType_velo[i]["id_type_velo"]);
    $('#nom_type_velo').val(aOfType_velo[i]["nom_type_velo"]);
    $('#actif_type_velo').val(aOfType_velo[i]["actif_type_velo"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("type_velo_valide");
    var btnModifier = document.getElementById("type_velo_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


const type_velo_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ type_velo par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "type_velo 0 à 0 sur 0 sélectionnée",
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
            "orderable": false
        }
    ],
    'retrieve': true
};
var tables;
$(document).ready(function () {
    
    loadType_velo();
    rebuildDatable();
    constructTable_type_velo();
    tables = $('#table_type_velo').DataTable(type_velo_configuration);

});