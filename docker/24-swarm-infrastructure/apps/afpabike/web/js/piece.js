/**
 * public aOfFilms is used to store all datas of movies
 * @var array
 */
var piecesExistantes= [];

/**
 * Get Movies from database
 *
 * if OK add movies to array aOfFilms
 *
 * if OK then build table and call datatable
 */
function loadPieces()	{
    $('#divModalSaving').show();
    var datas = {
        page : "liste_piece_gestion",
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
        piecesExistantes= result;
        // INIT DATATABLE
        // Si je souhaite avoir par défaut autre que les 10 résultats par défaut au chargement
        // tables.page.len(10).draw();
        constructTablePiece();
        tables = $('#tableau_pieces_existantes').DataTable(configuration);
        $('#divModalSaving').hide();
    })
    .fail(function(err) {
        alert('error : ' + err.status);
    });
}


function constructTablePiece()	{
    var i;

    var sHTML= "";
    sHTML+= "<thead>";
    sHTML+= "<tr>";
    sHTML+= "<th>Nom pièce</th>";
    sHTML+= "<th>Qté stock</th>";
    sHTML+= "<th>Actions</th>";
    sHTML+= "</tr>";
    sHTML+= "</thead>";
    sHTML+= "<tbody>";

    for (i=0; i<piecesExistantes.length; i++)	{
        sHTML+= "<tr>";
        sHTML+= "<td>" + piecesExistantes[i]["nom_piece"] + "</td>";
        sHTML+= "<td>" + piecesExistantes[i]["stock_piece"] + "</td>";
        sHTML+= "<td>Editer / Supprimer</td>";
        sHTML+= "</tr>";
    }
    
    sHTML+= "</tbody>";
    $('#tableau_pieces_existantes').html(sHTML);
}


/**
 * Configuration Datatable
 * 
 */
const configuration = {
    "stateSave": false,
    "order": [[0, "asc"]],
    "pagingType": "simple_numbers",
    "searching": true,
    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Tous"]], 
    "language": {
        "info": "Pièces _START_ à _END_ sur _TOTAL_ sélectionnées",
        "emptyTable": "Aucune pièce",
        "lengthMenu": "_MENU_ pièces par page",
        "search": "Rechercher : ",
        "zeroRecords": "Aucun résultat de recherche",
        "paginate": {
            "previous": "Précédent",
            "next": "Suivant"
        },
        "sInfoFiltered":   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
        "sInfoEmpty":      "Pièce 0 à 0 sur 0 sélectionnée",
    },
    "columns": [
        {
            "orderable": true
        },
        {
            "orderable": false
        },
        {
            "orderable": false
        }
    ],
    'retrieve': true
};


/**
 * Init start
 * 
 */
var tables;
$(document).ready(function() {
    loadPieces();
});
