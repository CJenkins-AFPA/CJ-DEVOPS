 var aOfVille = [];

function loadVille()	{
    $('#divModalSaving').show();
    var datas = {
        page : "ville_liste",
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
        var iville= 0;
        for (var ligne in result)	{
            aOfVille[iville]= [];
            aOfVille[iville]["id_ville"]= result[ligne]["id_ville"];
            aOfVille[iville]["nom_ville"]= result[ligne]["nom_ville"];
            aOfVille[iville]["actif_ville"]= result[ligne]["actif_ville"];
            iville++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_ville();
        tables = $('#table_ville').DataTable(ville_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_ville() {
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
    for (var i = 0; i < aOfVille.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"ville\">" + aOfVille[i]["id_ville"] + "</td>";  // ville
        sHTML += "<td name=\"ville\">" + aOfVille[i]["nom_ville"] + "</td>";  // ville
        sHTML += "<td name=\"ville\">" + aOfVille[i]["actif_ville"] + "</td>";  // ville
        sHTML += `<td >
                    <button onClick=\"editville(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimville(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_ville').html(sHTML);
}

function ajoutville()	{
	$('#divModalSaving').show();
    let ficheactive ="0"
    if ($('input[name="actif_ville"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "ville_save",
		bJSON : 1, 
		nom_ville: $('#nom_ville').val(),
		actif_ville: ficheactive
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
			var iLongueur= aOfVille.length;
			aOfVille[iLongueur]= [];
			aOfVille[iLongueur]["id_ville"]= result[0]["id_ville"];
			aOfVille[iLongueur]["nom_ville"]= $('#nom_ville').val();
            aOfVille[iLongueur]["actif_ville"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function modifVille()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_ville"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }
	var datas = {
		page : "ville_update",
		bJSON : 1, 
        id_ville: $('#id_ville').val(),
		nom_ville: $('#nom_ville').val(),
		actif_ville: ficheactive
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
			var iLongueur= aOfVille.length;
			aOfVille[iLongueur]= [];
			aOfVille[iLongueur]["id_ville"]= $('#id_ville').val();
			aOfVille[iLongueur]["nom_ville"]= $('#nom_ville').val();
            aOfVille[iLongueur]["actif_ville"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimville(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprville = aOfVille[iIndiceSuppr]["nom_ville"];
        $('#supprville').html(Supprville);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "ville_delete",
        bJSON : 1, 
        id_ville: aOfVille[iIndiceSuppr]["id_ville"]
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
            alert("Erreur lors de la suppression de votre ville. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfVille.length-1); i++)	{
                aOfVille[i]= aOfVille[i+1];
            }
            aOfVille.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre ville. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function rebuildDatable() {
    $('#table_ville').html("");

        tables.clear();
        tables.destroy();
    
    constructTable_ville();
    tables = $('#table_ville').DataTable(ville_configuration);
}


function videFormulaire() {
    $('#id_ville').val("");
    $('#nom_ville').val("");
    $('#actif_ville').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("ville_valide");
    var btnModifier = document.getElementById("ville_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editville(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfVille[i]["actif_ville"] == "1") {
        $("#actif_ville").prop('checked', true)
    }
    else{
        $("#actif_ville").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_ville').val(aOfVille[i]["id_ville"]);
    $('#nom_ville').val(aOfVille[i]["nom_ville"]);
    $('#actif_ville').val(aOfVille[i]["actif_ville"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("ville_valide");
    var btnModifier = document.getElementById("ville_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


const ville_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ ville par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "ville 0 à 0 sur 0 sélectionnée",
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
    
    loadVille();
    rebuildDatable();
    constructTable_ville();
    tables = $('#table_ville').DataTable(ville_configuration);

});