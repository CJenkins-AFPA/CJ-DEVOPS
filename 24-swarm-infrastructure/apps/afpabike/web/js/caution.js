 var aOfCaution = [];

function loadCaution()	{
    $('#divModalSaving').show();
    var datas = {
        page : "caution_liste",
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
        var icaution= 0;
        for (var ligne in result)	{
            aOfCaution[icaution]= [];
            aOfCaution[icaution]["id_caution"]= result[ligne]["id_caution"];
            aOfCaution[icaution]["libelle_caution"]= result[ligne]["libelle_caution"];
            aOfCaution[icaution]["montant_caution"]= result[ligne]["montant_caution"];
            aOfCaution[icaution]["actif_caution"]= result[ligne]["actif_caution"];
            icaution++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_caution();
        tables = $('#table_caution').DataTable(caution_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function constructTable_caution() {
    var i;
    var sHTML = "<thead>";
    sHTML += "<tr>";
    sHTML += "<th>ID</th>";
    sHTML += "<th>LIBELLE</th>";
    sHTML += "<th>MONTANT</th>";
    sHTML += "<th>ACTIF</th>";
    sHTML += "<th>Action</th>";
    sHTML += "</tr>";
    sHTML += "</thead>";
    sHTML += "<tbody>";

    // Boucle sur le tableau pour créer les lignes du tableau
    for (var i = 0; i < aOfCaution.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"caution\">" + aOfCaution[i]["id_caution"] + "</td>";  // caution
        sHTML += "<td name=\"caution\">" + aOfCaution[i]["libelle_caution"] + "</td>";
        sHTML += "<td name=\"caution\">" + aOfCaution[i]["montant_caution"] + "</td>";  // caution
        sHTML += "<td name=\"caution\">" + aOfCaution[i]["actif_caution"] + "</td>";  // caution
        sHTML += `<td >
                    <button onClick=\"editCaution(${i})\"' type='button' name='update' id='update' data-bs-toggle=\"modal\" data-bs-target=\"#exampleModal\">
                        <img src='image/modifier.png' id='img_update'>
                    </button>
                    <button onclick='supprimCaution(${i})' type='button' name='delete' id='delete'>
                        <img src='image/supprimer.png' id='img_delete'>
                    </button>
                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_caution').html(sHTML);
}

function ajoutCaution()	{
	$('#divModalSaving').show();
    let ficheactive ="0"
    if ($('input[name="actif_caution"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }

	var datas = {
		page : "caution_save",
		bJSON : 1, 
		libelle_caution: $('#libelle_caution').val(),
        montant_caution: $('#montant_caution').val(),
		actif_caution: ficheactive
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
			var iLongueur= aOfCaution.length;
			aOfCaution[iLongueur]= [];
			aOfCaution[iLongueur]["id_caution"]= result[0]["id_caution"];
			aOfCaution[iLongueur]["libelle_caution"]= $('#libelle_caution').val();
            aOfCaution[iLongueur]["montant_caution"]= $('#montant_caution').val();
            aOfCaution[iLongueur]["actif_caution"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function modifCaution()	{
	$('#divModalSaving').show();

    let ficheactive ="0"
    if ($('input[name="actif_caution"]:checked').val()) {
       ficheactive = 1
    }
    else  {
       ficheactive = 0
    }
	var datas = {
		page : "caution_update",
		bJSON : 1, 
        id_caution: $('#id_caution').val(),
		libelle_caution: $('#libelle_caution').val(),
        montant_caution: $('#montant_caution').val(),
		actif_caution: ficheactive
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
			var iLongueur= aOfCaution.length;
			aOfCaution[iLongueur]= [];
			aOfCaution[iLongueur]["id_caution"]= $('#id_caution').val();
			aOfCaution[iLongueur]["libelle_caution"]= $('#libelle_caution').val();
            aOfCaution[iLongueur]["montant_caution"]= $('#montant_caution').val();
            aOfCaution[iLongueur]["actif_caution"]= ficheactive;
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre Client. Vous allez être déconnecté.");
		self.location.href= "route.php?page=gestion_client"
	});
}

function supprimCaution(iIndiceSuppr)	{
    //Création des différentes variables pour le message de validation
		var modal = document.getElementById("confirmModal");
		var confirmYesBtn = document.getElementById("confirmYesBtn");
		var confirmNoBtn = document.getElementById("confirmNoBtn");
		// Récupération du prénom et nom à l'index donné
    var Supprcaution = aOfCaution[iIndiceSuppr]["libelle_caution"];
        $('#supprcaution').html(Supprcaution);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();
    
    var datas = {
        page : "caution_delete",
        bJSON : 1, 
        id_caution: aOfCaution[iIndiceSuppr]["id_caution"]
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
            alert("Erreur lors de la suppression de votre caution. Vous allez être déconnecté.");
            self.location.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfCaution.length-1); i++)	{
                aOfCaution[i]= aOfCaution[i+1];
            }
            aOfCaution.length--;
            rebuildDatable();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre caution. Vous allez être déconnecté.");
        self.location.href= "route.php?page=logout"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function rebuildDatable() {
    $('#table_caution').html("");

        tables.clear();
        tables.destroy();
    
    constructTable_caution();
    tables = $('#table_caution').DataTable(caution_configuration);
}


function videFormulaire() {
    $('#id_caution').val("");
    $('#libelle_caution').val("");
    $('#montant_caution').val("");
    $('#actif_caution').prop('checked', false);

}

function Fermeturemodal() {

    // Vider le formulaire
    videFormulaire();

    // Initialiser les boutons
    var btnAjouter = document.getElementById("caution_valide");
    var btnModifier = document.getElementById("caution_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "inline-block";
    btnModifier.style.display = "none";
}
 


var currentIndex = -1;

function editCaution(i) {
    // Sauvegarder l'index du vélo en cours d'édition
    currentIndex = i;

    if (aOfCaution[i]["actif_caution"] == "1") {
        $("#actif_caution").prop('checked', true)
    }
    else{
        $("#actif_caution").prop('checked', false)
    }

    // Remplir le formulaire avec les valeurs du vélo sélectionné
    $('#id_caution').val(aOfCaution[i]["id_caution"]);
    $('#libelle_caution').val(aOfCaution[i]["libelle_caution"]);
    $('#montant_caution').val(aOfCaution[i]["montant_caution"]);
    $('#actif_caution').val(aOfCaution[i]["actif_caution"]);


    // Initialiser les boutons
    var btnAjouter = document.getElementById("caution_valide");
    var btnModifier = document.getElementById("caution_modifier");

    // Masquer le bouton "Ajouter" et afficher le bouton "Modifier"
    btnAjouter.style.display = "none";
    btnModifier.style.display = "inline-block";
}


const caution_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, 100, -1], ["10", "25", "50", "100", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucun utilisateur",
        "lengthMenu": "_MENU_ caution par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "caution 0 à 0 sur 0 sélectionnée",
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
    
    loadCaution();
    rebuildDatable();
    constructTable_caution();
    tables = $('#table_caution').DataTable(caution_configuration);

});