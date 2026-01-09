var aOaCcessoires= [];

// aOaCcessoires[0]= [];
// aOaCcessoires[0]["id_accessoire"]= "1";
// aOaCcessoires[0]["nom_accessoire"]= "Casque"; /* présent dans le listing */
// aOaCcessoires[0]["etat_accessoire"]= "Correcte"; /* présent dans le listing */
// aOaCcessoires[0]["disponibilite_accessoire"]= "1"; /* présent dans le listing */
// aOaCcessoires[0]["photo_accessoire"]= "casque.png";
// aOaCcessoires[0]["couleur_accessoire"]= "Bleu"; /* présent dans le listing */
// aOaCcessoires[0]["numeroserie_accessoire"]= "CA 157810";
// aOaCcessoires[0]["prix_accessoire"]= "15.50";
// aOaCcessoires[0]["taille_accessoire"]= "M"; /* présent dans le listing */
// aOaCcessoires[0]["particularite_accessoire"]= "";
// aOaCcessoires[0]["numeroafpa_accessoire"]= "AFPA 2540";
// aOaCcessoires[0]["actif_accessoire"]= "1";

// aOaCcessoires[1]= [];
// aOaCcessoires[1]["id_accessoire"]= "2";
// aOaCcessoires[1]["nom_accessoire"]= "Gilet";
// aOaCcessoires[1]["etat_accessoire"]= "Correcte";
// aOaCcessoires[1]["disponibilite_accessoire"]= "0";
// aOaCcessoires[1]["photo_accessoire"]= "Gilet.png";
// aOaCcessoires[1]["couleur_accessoire"]= "Noire";
// aOaCcessoires[1]["numeroserie_accessoire"]= "gL 1248";
// aOaCcessoires[1]["prix_accessoire"]= "5";
// aOaCcessoires[1]["taille_accessoire"]= "M";
// aOaCcessoires[1]["particularite_accessoire"]= "";
// aOaCcessoires[1]["numeroafpa_accessoire"]= "AFPA1245";
// aOaCcessoires[1]["actif_accessoire"]= "";

// aOaCcessoires[2]= [];
// aOaCcessoires[2]["id_accessoire"]= "3";
// aOaCcessoires[2]["nom_accessoire"]= "Anti vol";
// aOaCcessoires[2]["etat_accessoire"]= "Correcte";
// aOaCcessoires[2]["disponibilite_accessoire"]= "1";
// aOaCcessoires[2]["photo_accessoire"]= "anti vol.png";
// aOaCcessoires[2]["couleur_accessoire"]= "Noire";
// aOaCcessoires[2]["numeroserie_accessoire"]= "124578";
// aOaCcessoires[2]["prix_accessoire"]= "45.6";
// aOaCcessoires[2]["taille_accessoire"]= "L";
// aOaCcessoires[2]["particularite_accessoire"]= "";
// aOaCcessoires[2]["numeroafpa_accessoire"]= "AFPA134579";
// aOaCcessoires[2]["actif_accessoire"]= "1";

    /**
     * Get accessoires from database
     *
     * if OK add movies to array aOaCcessoires
     *
     * if OK then build table and call datatable
     */
    function loadAccessoires()	{
        $('#divModalSaving').show();
        var datas = {
            page : "accessoire_liste",
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
            aOaCcessoires= result;

            constructTable();
        
            // INIT DATATABLE
            tables = $('#table_accessoires').DataTable(configuration);
            $('#divModalSaving').hide();
        })
        .fail(function(err) {
            alert('error : ' + err.status);
        });
    }

    
    function ajoutaCcessoires()	{
        // J'ajoute un nouvel élément dans mon tableau JS
        var b_disponibilite_accessoire= 1;
        if ($("input[type='radio'][id='disponibilite_accessoire'][value=0]").prop('checked') == true)   {
            b_disponibilite_accessoire= 0;
        }
        var iLongueur = aOaCcessoires.length;
        aOaCcessoires[iLongueur]= {
        // accessoire: $('#acc_accessoire').val(),
        nom_accessoire: $('#nom_accessoire').val(),
        etat_accessoire: $('#etat_accessoire').val(),
        photo_accessoire:$('#photo_accessoire').val(),
        couleur_accessoire:$('#couleur_accessoire').val(),
        numeroserie_accessoire:$('#numeroserie_accessoire').val(),
        prix_accessoire:$('#prix_accessoire').val(),
        taille_accessoire: $('#taille_accessoire').val(),
        disponibilite_accessoire: b_disponibilite_accessoire,
        particularite_accessoire:$('#particularite_accessoire').val(),
        numeroafpa_accessoire:$('#numeroafpa_accessoire').val(),
        };
   

         constructTable();
        
         effaceFormulaire();
         $('#addRowModal').modal('hide');
        // //  aOaCcessoires.push(nouvelAccessoire);
        
    }
        
        
    
    
    // aOaCcessoires.push(nouvelAccessoire);
    
    // function rebuildTable()	{
    //     // Je détruis le tableau du listing
    //     $('#table_accessoires').html("");
    //     console.log(tables);
    //     tables.clear();
    //     tables.destroy();
        
    //     // Je reconstruis le tableau du lsting à partir du nouveau tableau JS
    //     // Qui contient du coup, une entrée de +
    //     constructTable();
        
    //     // J'applique le style du DataTable avec son fichier de configuration
    //     tables = $('#table_accessoires').DataTable(configuration);
    // }
    

    function confirmsupprim(iIndiceSuppr)   {
        for (var i=iIndiceSuppr; i<(aOaCcessoires.length-1); i++)	{
            aOaCcessoires[i]= aOaCcessoires[i+1];
        }
        aOaCcessoires.length--;
        constructTable();
    }
    
    function effaceFormulaire()	{
        // J'efface les données du formulaire
        $('#nom_accessoire').val("");
        $('#etat_accessoire').val("");
        $('#couleur_accessoire').val("");
        $('#numeroserie_accessoire').val("");
        $('#prix_accessoire').val("");
        $('#taille_accessoire').val("");
        $('#particularite_accessoire').val("");
        $('#numeroafpa_accessoire').val("");
    }
    
    var iIndiceEditionToKeep;
    function editaCcessoires(i)	{
        // Vérification si le radio button de disponibilité est décoché (0)
        if (aOaCcessoires[i]["disponibilite_accessoire"] == "0")   {
            $("input[type='radio'][id='disponibilite_accessoire'][value='0']").prop('checked', true);
        }  else  {
            $("input[type='radio'][id='disponibilite_accessoire'][value='1']").prop('checked', true);
        }
        iIndiceEditionToKeep= i;
        $('#nom_accessoire').val( aOaCcessoires[i]["nom_accessoire"] );
        $('#etat_accessoire').val(aOaCcessoires[i]["etat_accessoire"]);
        $('#couleur_accessoire').val(aOaCcessoires[i]["couleur_accessoire"]);
        $('#numeroserie_accessoire').val(aOaCcessoires[i]["numeroserie_accessoire"]);
        $('#prix_accessoire').val(aOaCcessoires[i]["prix_accessoire"]);
        $('#taille_accessoire').val(aOaCcessoires[i]["taille_accessoire"]);
        $('#particularite_accessoire').val(aOaCcessoires[i]["particularite_accessoire"]);
        $('#numeroafpa_accessoire').val(aOaCcessoires[i]["numeroafpa_accessoire"]);

        $('#btn_ajouter').hide();
        $('#btn_modifier').show();
    }
    
    
    function constructTable()	{
        var i;

        var sHTML= "";
        sHTML+= "<thead>";
        sHTML+= "<tr>";
        // sHTML+= "<td>accessoire</td>";
        sHTML+= "<td>Nom</td>";
        sHTML+= "<td>Etat</td>";
        sHTML+= "<td>Disponibilité</td>";
        // sHTML+= "<td>photo</td>";
        sHTML+= "<td>Couleur</td>";
        // sHTML+= "<td>numero serie</td>";
        // sHTML+= "<td>prix</td>";
        sHTML+= "<td>Taille accessoire</td>";
        // sHTML+= "<td>particularite accessoire</td>";
        // sHTML+= "<td> accessoire</td>";
        sHTML+= "<td>Editer</td>";
        sHTML+= "<td>Supprimer</td>"
        sHTML+= "</tr>";
        sHTML+= "</thead>";
        sHTML+= "<tbody>";

        for (i=0; i<aOaCcessoires.length; i++)	{
            sHTML+= "<tr>";
            // sHTML+= "<td>" + aOaCcessoires[i]["id_accessoire"] + "</td>";
            sHTML+= "<td>" + aOaCcessoires[i]["nom_accessoire"] + "</td>";
            sHTML+= "<td>" + aOaCcessoires[i]["etat_accessoire"] + "</td>";
            var bDispo= "OUI";
            if (aOaCcessoires[i]["disponibilite_accessoire"] == 0)  {
                bDispo= "NON";
            }
            sHTML+= "<td>" + bDispo + "</td>";
            sHTML+= "<td>" + aOaCcessoires[i]["couleur_accessoire"] + "</td>";
            sHTML+= "<td>" + aOaCcessoires[i]["taille_accessoire"] + "</td>";
            sHTML+= "<td><img src=\"image/edit.png\" alt=\"Editer\" data-bs-toggle=\"modal\" data-bs-target=\"#addRowModal\" onClick=\"editaCcessoires(" + i + ")\" style=\"cursor: pointer; width: 20px; height: 20px\" class=\"edit-btn\"></td>";
            sHTML+= "<td><img src=\"image/delete.png\" onClick=\"confirmsupprim(" + i + ")\" alt=\"Supprimer\" style=\"cursor: pointer; width: 20px; height: 20px;\" class=\"delete-btn\"> </td>"
            sHTML+= "</tr>";
                  
			
                    
        }
        
        sHTML+= "</tbody>";
        $('#table_accessoires').html(sHTML);
    }

    // CONFIGURATION DATATABLE
    const configuration = {
        "stateSave": false,
        "order": [[0, "asc"]],
        "pagingType": "simple_numbers",
        "searching": true,
        "lengthMenu": [[5, 10,20, -1], ["cinq", "Dix", "Vingt", "Tous"]], 
        "language": {
            "info": "Accessoires _START_ à _END_ sur _TOTAL_ sélectionnées",
            "emptyTable": "Aucun accessoire",
            "lengthMenu": "_MENU_ Accessoire par page",
            "search": "Rechercher : ",
            "zeroRecords": "Aucun résultat de recherche",
            "paginate": {
                "previous": "Précédent",
                "next": "Suivant"
            },
            "sInfoFiltered":   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
            "sInfoEmpty":      "Accessoire 0 à 0 sur 0 sélectionnée",
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
            },
            {
                "orderable": false
            },
        ],
        'retrieve': true
    };

    var tables;
    $(document).ready(function() {
        loadAccessoires();
    })