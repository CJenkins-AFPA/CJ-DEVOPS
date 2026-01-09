 var aOfMarque = [];

function loadMarque()	{
    $('#divModalSaving').show();
    var datas = {
        page : "marque_liste",
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
        var imarque= 0;
        for (var ligne in result)	{
            aOfMarque[imarque]= [];
            aOfMarque[imarque]["id_marque"]= result[ligne]["id_marque"];
            aOfMarque[imarque]["nom_marque"]= result[ligne]["nom_marque"];
            aOfMarque[imarque]["actif_marque"]= result[ligne]["actif_marque"];
            imarque++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables_marques.page.len(10).draw();
        constructTable_marque();
        tables_marques = $('#table_marque').DataTable(marque_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_marque() {
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
    for (var i = 0; i < aOfMarque.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"marque\">" + aOfMarque[i]["id_marque"] + "</td>";  // Marque
        sHTML += "<td name=\"marque\">" + aOfMarque[i]["nom_marque"] + "</td>";  // Marque
        sHTML += "<td name=\"marque\">" + aOfMarque[i]["actif_marque"] + "</td>";  // Marque
        sHTML += `<td >
                    <button onClick=\"editMarque(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimMarque(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_marque').html(sHTML);
}

function ajoutMarque()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_marque"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "marque_save",
		bJSON : 1, 
		nom_marque: $('#nom_marque').val(),
		actif_marque: ficheactive
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
		$('#modal_admin_marque').dialog("close");
		$('.btn-close').click();
		$('#modele_bouton_ajout').click();
		loadModele_marque();
		$('#divModalSaving').hide();
	})
	.fail(function(err) {
		$('#modal_admin_marque').dialog("close");
		$('.btn-close').click();
		$('#modele_bouton_ajout').click();
		loadModele_marque();
		$('#divModalSaving').hide();
	});
}

function modifMarque()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_marque"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "marque_update",
		bJSON : 1, 
        id_marque: $('#id_marque').val(),
		nom_marque: $('#nom_marque').val(),
		actif_marque: ficheactive
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
			var iLongueur= aOfMarque.length;
			aOfMarque[iLongueur]= [];
			aOfMarque[iLongueur]["id_marque"]= $('#id_marque').val();
			aOfMarque[iLongueur]["nom_marque"]= $('#nom_marque').val();
            aOfMarque[iLongueur]["actif_marque"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimMarque(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprmarque = aOfMarque[iIndiceSuppr]["nom_marque"];
        $('#supprmarque').html(Supprmarque);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "marque_delete",
        bJSON : 1, 
        id_marque: aOfMarque[iIndiceSuppr]["id_marque"]
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
            alert("Erreur lors de la suppression de votre marque. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfMarque.length-1); i++)	{
                aOfMarque[i]= aOfMarque[i+1];
            }
            aOfMarque.length--;
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

function rebuildDatable() {
    $('#table_marque').html("");

        tables_marques.clear();
        tables_marques.destroy();
    
    constructTable_marque();
    tables_marques = $('#table_marque').DataTable(marque_configuration);
}


function videFormulaire() {
    $('#id_marque').val("");
    $('#nom_marque').val("");
    $('#actif_marque').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("marque_valide");
    var btnModifier = document.getElementById("marque_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editMarque(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfMarque[i]["actif_marque"] == "1") {
        $("#actif_marque").prop('checked', true)
    }
    else{
        $("#actif_marque").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_marque').val(aOfMarque[i]["id_marque"]);
    $('#nom_marque').val(aOfMarque[i]["nom_marque"]);
    $('#actif_marque').val(aOfMarque[i]["actif_marque"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("marque_valide");
    var btnModifier = document.getElementById("marque_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


var marque_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ Marque par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "Marque 0 à 0 sur 0 sélectionnée",
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
var tables_marques;
$(document).ready(function () {
    
    loadMarque();
    constructTable_marque();
    tables_marques = $('#table_marque').DataTable(marque_configuration);

});