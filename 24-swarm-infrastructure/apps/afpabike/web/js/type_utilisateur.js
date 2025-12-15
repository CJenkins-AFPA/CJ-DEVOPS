 var aOfType_utilisateur = [];

function loadType_utilisateur()	{
    $('#divModalSaving').show();
    var datas = {
        page : "type_utilisateur_liste",
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
        var itype_utilisateur= 0;
        for (var ligne in result)	{
            aOfType_utilisateur[itype_utilisateur]= [];
            aOfType_utilisateur[itype_utilisateur]["id_type_utilisateur"]= result[ligne]["id_type_utilisateur"];
            aOfType_utilisateur[itype_utilisateur]["nom_type_utilisateur"]= result[ligne]["nom_type_utilisateur"];
            aOfType_utilisateur[itype_utilisateur]["actif_type_utilisateur"]= result[ligne]["actif_type_utilisateur"];
            itype_utilisateur++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_type_utilisateur();
        tables = $('#table_type_utilisateur').DataTable(type_utilisateur_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_type_utilisateur() {
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
    for (var i = 0; i < aOfType_utilisateur.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"type_utilisateur\">" + aOfType_utilisateur[i]["id_type_utilisateur"] + "</td>";  // type_utilisateur
        sHTML += "<td name=\"type_utilisateur\">" + aOfType_utilisateur[i]["nom_type_utilisateur"] + "</td>";  // type_utilisateur
        sHTML += "<td name=\"type_utilisateur\">" + aOfType_utilisateur[i]["actif_type_utilisateur"] + "</td>";  // type_utilisateur
        sHTML += `<td >
                    <button onClick=\"editType_utilisateur(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimType_utilisateur(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_type_utilisateur').html(sHTML);
}

function ajoutType_utilisateur()	{
	$('#divModalSaving').show();
    let ficheactive ="0"
    if ($('input[name="actif_type_utilisateur"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "type_utilisateur_save",
		bJSON : 1, 
		nom_type_utilisateur: $('#nom_type_utilisateur').val(),
		actif_type_utilisateur: ficheactive
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
			var iLongueur= aOfType_utilisateur.length;
			aOfType_utilisateur[iLongueur]= [];
			aOfType_utilisateur[iLongueur]["id_type_utilisateur"]= result[0]["id_type_utilisateur"];
			aOfType_utilisateur[iLongueur]["nom_type_utilisateur"]= $('#nom_type_utilisateur').val();
            aOfType_utilisateur[iLongueur]["actif_type_utilisateur"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function modifType_utilisateur()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_type_utilisateur"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }
	var datas = {
		page : "type_utilisateur_update",
		bJSON : 1, 
        id_type_utilisateur: $('#id_type_utilisateur').val(),
		nom_type_utilisateur: $('#nom_type_utilisateur').val(),
		actif_type_utilisateur: ficheactive
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
			var iLongueur= aOfType_utilisateur.length;
			aOfType_utilisateur[iLongueur]= [];
			aOfType_utilisateur[iLongueur]["id_type_utilisateur"]= $('#id_type_utilisateur').val();
			aOfType_utilisateur[iLongueur]["nom_type_utilisateur"]= $('#nom_type_utilisateur').val();
            aOfType_utilisateur[iLongueur]["actif_type_utilisateur"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimType_utilisateur(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprtype_utilisateur = aOfType_utilisateur[iIndiceSuppr]["nom_type_utilisateur"];
        $('#supprtype_utilisateur').html(Supprtype_utilisateur);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "type_utilisateur_delete",
        bJSON : 1, 
        id_type_utilisateur: aOfType_utilisateur[iIndiceSuppr]["id_type_utilisateur"]
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
            alert("Erreur lors de la suppression de votre type_utilisateur. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfType_utilisateur.length-1); i++)	{
                aOfType_utilisateur[i]= aOfType_utilisateur[i+1];
            }
            aOfType_utilisateur.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre type_utilisateur. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function rebuildDatable() {
    $('#table_type_utilisateur').html("");

        tables.clear();
        tables.destroy();
    
    constructTable_type_utilisateur();
    tables = $('#table_type_utilisateur').DataTable(type_utilisateur_configuration);
}


function videFormulaire() {
    $('#id_type_utilisateur').val("");
    $('#nom_type_utilisateur').val("");
    $('#actif_type_utilisateur').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("type_utilisateur_valide");
    var btnModifier = document.getElementById("type_utilisateur_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editType_utilisateur(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfType_utilisateur[i]["actif_type_utilisateur"] == "1") {
        $("#actif_type_utilisateur").prop('checked', true)
    }
    else{
        $("#actif_type_utilisateur").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_type_utilisateur').val(aOfType_utilisateur[i]["id_type_utilisateur"]);
    $('#nom_type_utilisateur').val(aOfType_utilisateur[i]["nom_type_utilisateur"]);
    $('#actif_type_utilisateur').val(aOfType_utilisateur[i]["actif_type_utilisateur"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("type_utilisateur_valide");
    var btnModifier = document.getElementById("type_utilisateur_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


const type_utilisateur_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ type_utilisateur par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "type_utilisateur 0 à 0 sur 0 sélectionnée",
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
    
    loadType_utilisateur();
    rebuildDatable();
    constructTable_type_utilisateur();
    tables = $('#table_type_utilisateur').DataTable(type_utilisateur_configuration);

});