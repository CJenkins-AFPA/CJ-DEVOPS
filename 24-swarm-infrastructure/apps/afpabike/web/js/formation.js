 var aOfFormation = [];

function loadFormation()	{
    $('#divModalSaving').show();
    var datas = {
        page : "formation_liste",
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
        var iformation= 0;
        for (var ligne in result)	{
            aOfFormation[iformation]= [];
            aOfFormation[iformation]["id_formation"]= result[ligne]["id_formation"];
            aOfFormation[iformation]["nom_formation"]= result[ligne]["nom_formation"];
            aOfFormation[iformation]["actif_formation"]= result[ligne]["actif_formation"];
            iformation++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_formation();
        tables = $('#table_formation').DataTable(formation_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_formation() {
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
    for (var i = 0; i < aOfFormation.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"formation\">" + aOfFormation[i]["id_formation"] + "</td>";  // formation
        sHTML += "<td name=\"formation\">" + aOfFormation[i]["nom_formation"] + "</td>";  // formation
        sHTML += "<td name=\"formation\">" + aOfFormation[i]["actif_formation"] + "</td>";  // formation
        sHTML += `<td >
                    <button onClick=\"editformation(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimformation(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_formation').html(sHTML);
}

function ajoutformation()	{
	$('#divModalSaving').show();
    let ficheactive ="0"
    if ($('input[name="actif_formation"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "formation_save",
		bJSON : 1, 
		nom_formation: $('#nom_formation').val(),
		actif_formation: ficheactive
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
			var iLongueur= aOfFormation.length;
			aOfFormation[iLongueur]= [];
			aOfFormation[iLongueur]["id_formation"]= result[0]["id_formation"];
			aOfFormation[iLongueur]["nom_formation"]= $('#nom_formation').val();
            aOfFormation[iLongueur]["actif_formation"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function modifFormation()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_formation"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }
	var datas = {
		page : "formation_update",
		bJSON : 1, 
        id_formation: $('#id_formation').val(),
		nom_formation: $('#nom_formation').val(),
		actif_formation: ficheactive
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
			var iLongueur= aOfFormation.length;
			aOfFormation[iLongueur]= [];
			aOfFormation[iLongueur]["id_formation"]= $('#id_formation').val();
			aOfFormation[iLongueur]["nom_formation"]= $('#nom_formation').val();
            aOfFormation[iLongueur]["actif_formation"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimformation(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprformation = aOfFormation[iIndiceSuppr]["nom_formation"];
        $('#supprformation').html(Supprformation);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "formation_delete",
        bJSON : 1, 
        id_formation: aOfFormation[iIndiceSuppr]["id_formation"]
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
            alert("Erreur lors de la suppression de votre formation. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfFormation.length-1); i++)	{
                aOfFormation[i]= aOfFormation[i+1];
            }
            aOfFormation.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre formation. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function rebuildDatable() {
    $('#table_formation').html("");

        tables.clear();
        tables.destroy();
    
    constructTable_formation();
    tables = $('#table_formation').DataTable(formation_configuration);
}


function videFormulaire() {
    $('#id_formation').val("");
    $('#nom_formation').val("");
    $('#actif_formation').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("formation_valide");
    var btnModifier = document.getElementById("formation_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editformation(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfFormation[i]["actif_formation"] == "1") {
        $("#actif_formation").prop('checked', true)
    }
    else{
        $("#actif_formation").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_formation').val(aOfFormation[i]["id_formation"]);
    $('#nom_formation').val(aOfFormation[i]["nom_formation"]);
    $('#actif_formation').val(aOfFormation[i]["actif_formation"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("formation_valide");
    var btnModifier = document.getElementById("formation_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


const formation_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ formation par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "formation 0 à 0 sur 0 sélectionnée",
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
    
    loadFormation();
    rebuildDatable();
    constructTable_formation();
    tables = $('#table_formation').DataTable(formation_configuration);

});