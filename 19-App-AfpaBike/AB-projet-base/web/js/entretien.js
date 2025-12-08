 var aOfRep = [];


/*Chargement de la liste des velo a reparer */
function loadReparation()	{
    $('#divModalSaving').show();
    var datas = {
        page : "liste_entretien",
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
        var ireparation= 0;
        for (var ligne in result)	{
            aOfRep[ireparation]= [];
            aOfRep[ireparation]["id_reparation"]= result[ligne]["id_reparation"];
            aOfRep[ireparation]["nom_marque"]= result[ligne]["nom_marque"];
            aOfRep[ireparation]["nom_modele"]= result[ligne]["nom_modele"];
            aOfRep[ireparation]["numeroafpa_velo"]= result[ligne]["numeroafpa_velo"];
            aOfRep[ireparation]["datedebut_reparation"]= result[ligne]["datedebut_reparation"];
            aOfRep[ireparation]["datefin_reparation"]= result[ligne]["datefin_reparation"];
            aOfRep[ireparation]["nom_typerep"]= result[ligne]["nom_typerep"];
            aOfRep[ireparation]["duree_typerep"]= result[ligne]["duree_typerep"];
            ireparation++;
        }
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTable_rep();
        tables = $('#table_rep').DataTable(rep_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
    
}

function ajoutRep()	{
	$('#divModalSaving').show();

	var datas = {
		page : "entretien_save",
		bJSON : 1, 
        id_velo: $("#velo_list option[value='"+$('#velo_datalist').val()+"']").attr("data-id-velo") ,
        id_typerep: $("#id_typerep").val() 
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
			alert("Erreur lors de l'ajout de votre reparation. Vous allez être déconnecté.");
			//self.entretien.href= "route.php?page=gestion_entretien"
		}  else  {
            loadReparation();
			$('#divModalSaving').hide();
		}
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout de votre reparation. Vous allez être déconnecté.");
		//self.location.href= "route.php?page=gestion_entretien"
	});
    document.getElementById('rep_modifier').style.display = "none";
}

var aOfEntretien_velo= [];
//------------------------------------Fonction pour la creation de Velo_entretien------------------------------------
function choixentretien_velo() {                              
    var schoixentretien_velo = ""
    for (var i = 0; i < aOfEntretien_velo.length; i++) {
        if ((aOfEntretien_velo[i]["actif_velo"] == 0) || (aOfEntretien_velo[i]["etat_velo"] != "ok") ) {
            schoixentretien_velo += "";
        } else {
            schoixentretien_velo += "<option value=\"" + aOfEntretien_velo[i]["nom_marque"] + " | " +  aOfEntretien_velo[i]["nom_modele"] + " | " +  aOfEntretien_velo[i]["nom_type_velo"] + " | " + "N°" +  aOfEntretien_velo[i]["numeroafpa_velo"] + "\" data-id-velo=\"" + aOfEntretien_velo[i]["id_velo"] + "\"></option>";
        }

    }
    schoixentretien_velo += "</datalist>"
    $('#velo_list').html(schoixentretien_velo);
}
    function loadentretien_velo()	{
        $('#divModalSaving').show();
        var datas = {
            page : "entretien_velo_liste",
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
            aOfEntretien_velo= result;
            choixentretien_velo();
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
}

function loadreparation_velo()	{
    $('#divModalSaving').show();
    var datas = {
        page : "entretien_reparation_liste",
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
        var shtmlselect ="";
        for(var iselect=0;iselect<result.length;iselect++)  {
            shtmlselect+="<option value=\""+result[iselect]["id_typerep"]+"\">"+result[iselect]["nom_typerep"]+"</option>";

        }
        $('#id_typerep').html(shtmlselect);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}
/*Fonction pour supprimer une reparation de la liste */
function supprimRep(iIndiceSuppr)	{
    $('#divModalSaving').show();
    var datas = {
        page : "supprime_entretien",
        bJSON : 1, 
        id_reparation: aOfRep[iIndiceSuppr]["id_reparation"]
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
            alert("Erreur lors de la suppression de votre acteur. Vous allez être déconnecté.");
            self.entretien.href= "route.php?page=logout"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfRep.length-1); i++)	{
                aOfRep[i]= aOfRep[i+1];
            }
            aOfRep.length--;
            rebuildDatable();
            videFormulaire();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre acteur. Vous allez être déconnecté.");
        self.entretien.href= "route.php?page=logout"
    });
}

/*Construction du tableau reparation */
function constructTable_rep() {
    var i;
    var sHTML = "<thead>";
    sHTML += "<tr>";
    sHTML += "<th>Marque</th>";
    sHTML += "<th>Modele</th>";
    sHTML += "<th>Numéro afpa</th>";
    sHTML += "<th>Date d'Entrée</th>";
    sHTML += "<th>Date de Sortie</th>";
    sHTML += "<th>Type de reparation</th>";
    sHTML += "<th>Temps Estimé</th>";
    sHTML += "<th>Action</th>";
    sHTML += "</tr>";
    sHTML += "</thead>";
    sHTML += "<tbody>";

    // Boucle sur le tableau pour créer les lignes du tableau
    for (var i = 0; i < aOfRep.length; i++) {
        sHTML += "<tr>";
        sHTML += "<td name=\"marque\">" + aOfRep[i]["nom_marque"] + "</td>";  // Marque
        sHTML += "<td name=\"modele\">" + aOfRep[i]["nom_modele"] + "</td>";  // Marque
        sHTML += "<td name=\"num\">" + aOfRep[i]["numeroafpa_velo"] + "</td>";  // Numéro Vélo
        sHTML += "<td name=\"date_entree\">" + aOfRep[i]["datedebut_reparation"] + "</td>";  // Date de Sortie
        sHTML += "<td name=\"date_sortie\">" + aOfRep[i]["datefin_reparation"] + "</td>";  // Date d'Entrée
        sHTML += "<td name=\"type_rep\">" + aOfRep[i]["nom_typerep"] + "</td>";  // Pièce à Réparer
        sHTML += "<td name=\"temps\">" + aOfRep[i]["duree_typerep"] + "min" + "</td>";  // Temps estimé
        sHTML += `<td >
                    <button onclick='supprimRep(${i})' type='button' name='delete' id='delete'>
                        <img src='image/delete.png' id='img_delete'>
                    </button>
                    <button onclick='editReparation(${i})' type='button' name='modif' id='modif' data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <img src='image/edit.png' id='img_update'>
                    </button>

                  </td>`;
        sHTML += "</tr>";
    }

    sHTML += "</tbody>";
    $('#table_rep').html(sHTML);
}

function rebuildDatable() {
    $('#table_rep').html("");
    tables.clear();
    tables.destroy();  
    constructTable_rep();
    tables = $('#table_rep').DataTable(rep_configuration);
}


function videFormulaire() {
    $('#velo_datalist').val("");
    $('#id_typerep').val("");


}

var currentIndex = -1;
function editReparation(i) {
    $('#divModalSaving').show();
    currentIndex = i;
    $('#id_reparation').val(aOfRep[currentIndex]["id_reparation"]);
    $('#id_typerep').val(aOfRep[currentIndex]["id_typerep"]);
    $("#velo_list option").each(function(i){
        if ($("#velo_list option[value='"+$(this).val()+"']").attr("data-id-velo") == (aOfRep[currentIndex]["id_velo"])) {
            $('#velo_datalist').val( $(this).val() );
        }
    });
    //Cacher le bouton MODIFIER et ANNULER
    document.getElementById('rep_valide').style.display = "none";
    //Apparaître le bouton AJOUTER
    document.getElementById('rep_modifier').style.display = "inline-block";
    document.getElementById('rep_annuler').style.display = "inline-block";

}

function modifRep()	{
    
	var datas = {
		page : "entretien_update",
        bJSON : 1, 
        id_reparation: $("#id_reparation").val(),
        id_velo: $("#velo_list option[value='"+$('#velo_datalist').val()+"']").attr("data-id-velo") ,
        id_typerep: $("#id_typerep").val() 
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

			alert("Erreur lors de l'ajout du retour de location. Vous allez être déconnecté.");
			self.location.href= "route.php?page=location_contrat"
		}  else  {
			var ireparation= aOfRep.length;
            aOfRep[ireparation]= [];
            aOfRep[ireparation]["id_reparation"]= $("#id_reparation").val();
            aOfRep[ireparation]["id_typerep"]= $("#id_typerep").val();
            aOfRep[ireparation]["id_velo"]= $("#id_velo").val();

		}

        rebuildDatable();
        videFormulaire();
	})
	.fail(function(err) {
		console.log('error : ' + err.status);
		alert("Erreur lors de l'ajout du retour de location. Vous allez être déconnecté.");
		self.location.href= "route.php?page=entretien_gestion"
	});


}

const rep_configuration = {
    "stateSave": false,
    "order": [[1, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[3, 5, 10, 25, -1], ["3", "5", "10", "25", "Tout"]],
    "language": {
        "info": "Réparation _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucune réparation",
        "lengthMenu": "_MENU_ Réparation par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered": "(filtré de _MAX_ éléments au total)",
        "sInfoEmpty": "Réparation 0 à 0 sur 0 sélectionnée",
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
    
    loadReparation();
    constructTable_rep();
    loadentretien_velo();
    loadreparation_velo();
});