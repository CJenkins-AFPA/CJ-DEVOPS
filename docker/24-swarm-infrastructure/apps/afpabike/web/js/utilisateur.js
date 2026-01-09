var aOfUtilisateurs = [];

function loadUtilisateur()	{
    $('#divModalSaving').show();
    var datas = {
        page : "utilisateur_liste",
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
        var iLongueur= 0;
        for (var ligne in result)	{
            aOfUtilisateurs[iLongueur]= [];
            aOfUtilisateurs[iLongueur]["id_utilisateur"]= result[ligne]["id_utilisateur"];
            aOfUtilisateurs[iLongueur]["nom_utilisateur"]= result[ligne]["nom_utilisateur"];
            aOfUtilisateurs[iLongueur]["prenom_utilisateur"]= result[ligne]["prenom_utilisateur"];
            aOfUtilisateurs[iLongueur]["login_utilisateur"]= result[ligne]["login_utilisateur"];
            aOfUtilisateurs[iLongueur]["email_utilisateur"]= result[ligne]["email_utilisateur"];
            aOfUtilisateurs[iLongueur]["tel_utilisateur"]= result[ligne]["tel_utilisateur"];
            aOfUtilisateurs[iLongueur]["type_utilisateur"]= result[ligne]["nom_type_utilisateur"];
            aOfUtilisateurs[iLongueur]["finformation_utilisateur"]= result[ligne]["finformation_utilisateur"];
            aOfUtilisateurs[iLongueur]["finformation_utilisateur_lisible"]= result[ligne]["finformation_utilisateur_lisible"];
            iLongueur++;
        }

        constructTable();
        tables = $('#utilisateur_table').DataTable(utilisateur_configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

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
        var shtmlselect ="";
        for(var iselect=0;iselect<result.length;iselect++)  {
            shtmlselect+="<option value=\""+result[iselect]["id_type_utilisateur"]+"\">"+result[iselect]["nom_type_utilisateur"]+"</option>";

        }
        $('#id_type_utilisateur').html(shtmlselect);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

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
        var shtmlselect ="";
        for(var iselect=0;iselect<result.length;iselect++)  {
            shtmlselect+="<option value=\""+result[iselect]["id_ville"]+"\">"+result[iselect]["nom_ville"]+"</option>";

        }
        $('#id_ville').html(shtmlselect);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}

function ajoutUser() {
    $('#divModalSaving').show();
    var datas = {
        page : "utilisateur_save",
        bJSON : 1, 
        id_ville: $('#id_ville').val(),
        id_formation: $('#id_formation').val(),
        id_type_utilisateur: $('#id_type_utilisateur').val(),
        nom_utilisateur:$('#nom_utilisateur').val(),
        prenom_utilisateur:$('#prenom_utilisateur').val(),
        login_utilisateur:$('#login_utilisateur').val(),
        email_utilisateur:$('#email_utilisateur').val(),
        tel_utilisateur:$('#tel_utilisateur').val(),
        type_utilisateur:$('#type_utilisateur').val(),
        finformation_utilisateur:$('#finformation_utilisateur').val(),
        mdp_utilisateur: $('#mdp_utilisateur').val(),
        debutformation_utilisateur: $('#debutformation_utilisateur').val(),
        adresse_utilisateur: $('#adresse_utilisateur').val(),
        codepostal_utilisateur: $('#codepostal_utilisateur').val(),
        complementadresse_utilisateur: $('#complementadresse_utilisateur').val(),
        dateinscription_utilisateur: $('#dateinscription_utilisateur').val(),
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
            alert("Erreur lors de l'ajout de votre utilisateur. Vous allez être déconnecté.");
            self.location.href= "route.php?page=utilisateur_gestion"
        }  else  {
            loadUtilisateur();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de l'ajout de votre utilisateur. Vous allez être déconnecté.");
        self.location.href= "route.php?page=utilisateur_gestion"
    });
    rebuildTableau();
    effaceFormulaire();
}

function modifUser()	{
    var modal = document.getElementById("editConfirmModal");
        var editConfirmYesBtn = document.getElementById("editConfirmYesBtn");
        var editConfirmNoBtn = document.getElementById("editConfirmNoBtn");
        modal.style.display = "block";
        editConfirmYesBtn.onclick = function() {
	    $('#divModalSaving').show();

	var datas = {
		page : "utilisateur_update",
		bJSON : 1,  
        id_utilisateur: $('#id_utilisateur').val(),
        
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
			alert("Erreur lors de l'ajout de votre utilisateur. Vous allez être déconnecté.");
			self.location.href= "route.php?page=utilisateur_gestion"
		}  else  {
			var iLongueur= aOfUtilisateurs.length;
            aOfUtilisateurs[iLongueur]["id_utilisateur"]= result[ligne]["id_utilisateur"];
            aOfUtilisateurs[iLongueur]["nom_utilisateur"]= result[ligne]["nom_utilisateur"];
            aOfUtilisateurs[iLongueur]["prenom_utilisateur"]= result[ligne]["prenom_utilisateur"];
            aOfUtilisateurs[iLongueur]["login_utilisateur"]= result[ligne]["login_utilisateur"];
            aOfUtilisateurs[iLongueur]["email_utilisateur"]= result[ligne]["email_utilisateur"];
            aOfUtilisateurs[iLongueur]["tel_utilisateur"]= result[ligne]["tel_utilisateur"];
            aOfUtilisateurs[iLongueur]["finformation_utilisateur"]= result[ligne]["finformation_utilisateur"];
            aOfUtilisateurs[iLongueur]["id_ville"]= result[ligne]["id_ville"];
            aOfUtilisateurs[iLongueur]["id_formation"]= result[ligne]["id_formation"];
            aOfUtilisateurs[iLongueur]["id_type_utilisateur"]= result[ligne]["id_type_utilisateur"];
            aOfUtilisateurs[iLongueur]["mdp_utilisateur"]= result[ligne]["mdp_utilisateur"];
            aOfUtilisateurs[iLongueur]["debutformation_utilisateur"]= result[ligne]["debutformation_utilisateur"];
            aOfUtilisateurs[iLongueur]["adresse_utilisateur"]= result[ligne]["adresse_utilisateur"];
            aOfUtilisateurs[iLongueur]["codepostal_utilisateur"]= result[ligne]["codepostal_utilisateur"];
            aOfUtilisateurs[iLongueur]["complementadresse_utilisateur"]= result[ligne]["complementadresse_utilisateur"];
            aOfUtilisateurs[iLongueur]["dateinscription_utilisateur"]= result[ligne]["dateinscription_utilisateur"];
        }
	})
    }
    // Fonction si l'utilisateur appuie sur NON
    editConfirmNoBtn.onclick = function() {
        annulUser(),
        modal.style.display = "none";
    };
}

function editUser(i) {
    
    $('#divModalSaving').show();
    // Sauvegarder l'index de l'utilisateur en cours d'édition
    currentIndex = i;

    // Remplir le formulaire avec les valeurs de l'utilisateur sélectionné
    $('#id_ville').val(aOfUtilisateurs[i]["id_ville"]);
    $('#id_formation').val(aOfUtilisateurs[i]["id_formation"]);
    $('#id_type_utilisateur').val(aOfUtilisateurs[i]["id_type_utilisateur"]);
    $('#nom_utilisateur').val(aOfUtilisateurs[i]["nom_utilisateur"]);
    $('#prenom_utilisateur').val(aOfUtilisateurs[i]["prenom_utilisateur"]);
    $('#login_utilisateur').val(aOfUtilisateurs[i]["login_utilisateur"]);
    $('#email_utilisateur').val(aOfUtilisateurs[i]["email_utilisateur"]);
    $('#tel_utilisateur').val(aOfUtilisateurs[i]["tel_utilisateur"]);
    $('#type_utilisateur').val(aOfUtilisateurs[i]["type_utilisateur"]);
    $('#finformation_utilisateur').val(aOfUtilisateurs[i]["finformation_utilisateur"]);
    $('#mdp_utilisateur').val(aOfUtilisateurs[i]["mdp_utilisateur"]);
    $('#debutformation_utilisateur').val(aOfUtilisateurs[i]["debutformation_utilisateur"]);
    $('#adresse_utilisateur').val(aOfUtilisateurs[i]["adresse_utilisateur"]);
    $('#codepostal_utilisateur').val(aOfUtilisateurs[i]["codepostal_utilisateur"]);
    $('#complementadresse_utilisateur').val(aOfUtilisateurs[i]["complementadresse_utilisateur"]);
    $('#dateinscription_utilisateur').val(aOfUtilisateurs[i]["dateinscription_utilisateur"]);
    
}

function supprimUser(iIndiceSuppr)	{
     //Création des différentes variables pour le message de validation
        var modal = document.getElementById("confirmModal");
        var confirmYesBtn = document.getElementById("confirmYesBtn");
        var confirmNoBtn = document.getElementById("confirmNoBtn");
    var SupprUser = aOfUtilisateurs[iIndiceSuppr]["nom_utilisateur"];
        $("#suppprenom").html(SupprUser);
        modal.style.display = "block";

    confirmYesBtn.onclick = function() {
    $('#divModalSaving').show();

    var datas = {
        page : "utilisateur_supprime",
        bJSON : 1, 
        id_utilisateur: aOfUtilisateurs[iIndiceSuppr]["id_utilisateur"]
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
            alert("Erreur lors de la suppression de votre utilisateur. Vous allez être déconnecté.");
            self.location.href= "route.php?page=utilisateur_gestion"
        }  else  {
            for (var i=iIndiceSuppr; i<(aOfUtilisateurs.length-1); i++)	{
                aOfUtilisateurs[i]= aOfUtilisateurs[i+1];
            }
            aOfUtilisateurs.length--;
            rebuildTableau();
            $('#divModalSaving').hide();
        }
    })
    .fail(function(err) {
        console.log('error : ' + err.status);
        alert("Erreur lors de la suppression de votre utilisateur. Vous allez être déconnecté.");
        self.location.href= "route.php?page=utilisateur_gestion"
    });
}
    // Fonction si l'utilisateur appuie sur NON
    confirmNoBtn.onclick = function() {
        modal.style.display = "none";
    };
}

function annulUser() {
    effaceFormulaire();
    $('#btn_ajouter').show();
    $('#btn_modifier').hide();
}

function effaceFormulaire() {
    $('#nom_utilisateur').val("");
    $('#id_ville').val("");
    $('#id_formation').val("");
    $('#id_type_utilisateur').val("");
    $('#nom_utilisateur').val("");
    $('#prenom_utilisateur').val("");
    $('#login_utilisateur').val("");
    $('#email_utilisateur').val("");
    $('#tel_utilisateur').val("");
    $('#type_utilisateur').val("");
    $('#finformation_utilisateur').val("");
    $('#mdp_utilisateur').val("");
    $('#debutformation_utilisateur').val("");
    $('#adresse_utilisateur').val("");
    $('#codepostal_utilisateur').val("");
    $('#complementadresse_utilisateur').val("");
    $('#dateinscription_utilisateur').val("");
}
    
function rebuildTableau() {
    $('#utilisateur_table').html("");
    tables.clear();
    tables.destroy();
    constructTable();
    tables = $('#utilisateur_table').DataTable(utilisateur_configuration);
}

function constructTable() {
    var i;
    var sHTML = "";
        sHTML += "<thead>";
        sHTML += "<tr>";
        sHTML += "<td>Nom</td>";
        sHTML += "<td>Prénom</td>";
        sHTML += "<td>Identifiant</td>";
        sHTML += "<td>Email</td>";
        sHTML += "<td>Téléphone</td>";
        sHTML += "<td>Profil</td>";
        sHTML += "<td>Date fin de formation</td>";
        sHTML += "<td>Editer</td>";
        sHTML += "<td>Supprimer</td>";
        sHTML += "</tr>";
        sHTML += "</thead>";
        sHTML += "<tbody>";
    
            for (i = 0; i < aOfUtilisateurs.length; i++) {
                sHTML += "<tr>";
                sHTML += "<td>" + aOfUtilisateurs[i]["nom_utilisateur"] + "</td>";
                sHTML += "<td>" + aOfUtilisateurs[i]["prenom_utilisateur"] + "</td>";
                sHTML += "<td>" + aOfUtilisateurs[i]["login_utilisateur"] + "</td>";
                sHTML += "<td>" + aOfUtilisateurs[i]["email_utilisateur"] + "</td>";
                sHTML += "<td>" + aOfUtilisateurs[i]["tel_utilisateur"] + "</td>";
                sHTML += "<td>" + aOfUtilisateurs[i]["type_utilisateur"] + "</td>";
                sHTML += "<td>" + aOfUtilisateurs[i]["finformation_utilisateur_lisible"] + "</td>";
                sHTML += `<td> <img onClick=\"editUser(${i})\" src='image/edit.png' alt='Edit'</td>`
                sHTML += `<td> <img onClick=\"supprimUser(${i})\" src='image/delete.png' alt='Delete'></td>`;
                sHTML += "</tr>";
            }
    
            sHTML += "</tbody>";
            $('#utilisateur_table').html(sHTML);
    }
    
    const utilisateur_configuration = {
        "stateSave": false,
        "order": [[1, "asc"]],
        "pagingType": "simple_numbers",
        "searching": true,
        "lengthMenu": [[5, 10, 20, -1], ["5", "10", "20", "Tous"]], 
        "language": {
            "info": "Utilisateurs _START_ à _END_ sur _TOTAL_ sélectionnés",
            "emptyTable": "Aucun utilisateur",
            "lengthMenu": "_MENU_ Utilisateurs par page",
            "search": "Rechercher : ",
            "zeroRecords": "Aucun résultat de recherche",
            "paginate": {
                "previous": "Précédent",
                "next": "Suivant"
            },
            "sInfoFiltered": "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
            "sInfoEmpty": "Utilisateurs 0 à 0 sur 0 sélectionnée",
        },
        "columns": [
            {"orderable": true},
            {"orderable": true},
            {"orderable": true},
            {"orderable": true},
            {"orderable": true},
            {"orderable": true},
            {"orderable": true},
            {"orderable": false},
            {"orderable": false}
        ],
        'retrieve': true
    };
    var tables;
    $(document).ready(function() {
        loadUtilisateur();
        constructTable();
        // INIT DATATABLE
        tables = $('#utilisateur_table').DataTable(utilisateur_configuration);
    
    });