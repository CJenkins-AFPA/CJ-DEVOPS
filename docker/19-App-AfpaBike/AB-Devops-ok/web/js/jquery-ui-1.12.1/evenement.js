$(document).ready(function() {

    // *******************
    // début fonctions CSS
    // *******************

    // fonction pour le datetimepicker de JQUERY UI
    jQuery('#evt_id_date_debut, #evt_date_fin_plage').datetimepicker({format:'Y-m-d H:i:00'});

    jQuery.datetimepicker.setLocale('fr');

    // ajustement des tailles des filedsets quand on resize la fenetre (#Responsive JQUERY)
    //avec la fonctionnalité resize
    $(window).on("resize", function() {
        var LargeurFenetreContentRd = $("#content-rd").width();
        var HauteurContentRd = $("#content-rd").height();
        var LargeurWindow = $(window).width();
        // var HauteurFenetreContentRd = $("#content-rd").heigth();

        if (LargeurWindow > 1000) {
            if ($("#evt_chk_concerne_autres").prop("checked")) {
                $("#evt_div_partie_gauche").css({
                    width: (LargeurFenetreContentRd * 0.66) + "px"
                });
                $("#evt_div_partie_droite, #evt_fieldset_selection_destinataire").css({
                    width: (LargeurFenetreContentRd * 0.28) + "px"
                });
                $("#evt_id_renseign_gene").css({
                    width: (LargeurFenetreContentRd * 0.98) + "px"
                });
                $("#evt_div_englob_section_display, #evt_fieldset_selection_destinataire").css({
                    heigth: (HauteurContentRd * 0.98) + "px"
                });
            } else {
                $("#evt_div_partie_gauche, #evt_id_renseign_gene, #evt_id_fieldset_periodicite, #fieldset_ajout_document").css({
                    width: (LargeurFenetreContentRd * 0.98) + "px"
                });
            }
        } else {
            $("#evt_div_partie_gauche, #evt_div_partie_droit, #evt_id_fieldset_periodicite").css({
                width: (LargeurFenetreContentRd * 0.98) + "px"
            });
        }
    });

     // au clic sur "Périodicité" cela ouvre la div avec toutes les fonctionnalités correspondantent
    $("input[name=evt_chk_periodicite_oui]").on("change", function() {

        if ($("input[name=evt_chk_periodicite_oui]").prop('checked')) {
            $("#evt_id_menu_gene_periodicite").css({
                display: "flex"
            });

            var HauteurFenetrePerio = $("#evt_id_fieldset_periodicite").height();
            var LargeurFenetrePerio = $("#evt_id_fieldset_periodicite").width();

            $("#evt_separate_perio").css({
                height: HauteurFenetrePerio + "px"
            });
            $("#evt_id_fieldset_periodicite").css({
                width: (LargeurFenetrePerio * 0.66) + "px"
            });
            $("#evt_fieldset_plage_periodicite").css({
                display: "flex",
                width: (LargeurFenetrePerio * 0.33) + "px"
            });
            $("#choix_plage_periodicite").css({
                marginTop: (HauteurFenetrePerio * 0.2) + "px"
            });
            $("#evt_id_choix_plage_periodicite_parent").css({
                marginTop: (HauteurFenetrePerio * 0.25) + "px"
            })

        } else {
            $("#evt_id_menu_gene_periodicite :input").prop("checked", "")

            $("#evt_rd_frequence_jours, #evt_rd_frequence_semaine, #evt_rd_frequence_mois, #evt_id_menu_gene_periodicite, #evt_fieldset_plage_periodicite").css({
                display: "none"
            })

            var LargeurFenetreContentRd = $("#content-rd").width();
            $("#evt_id_fieldset_periodicite").css({
                width: LargeurFenetreContentRd + "px"
            })
        }
    })

// gestion de l'apparition et disparition des différentes périodicité
    $("#evt_id_menu_gene_periodicite").on("change", function() {

        // si on coche "Journalière" fait apparaitre la div et fait disparaitre les 3 autres
        if ($("#evt_rd_frequence_jour").prop('checked')) {
            $("#evt_id_frequence_jour").css({
                display: "flex"
            })
            $("#evt_id_frequence_semaine, #evt_id_frequence_mois, #evt_id_frequence_session").css({
                display: "none"
            })

        // si on coche "Hebdo" fait apparaitre les div jours et semaine, fait disparaitre les autres
        } else if ($("#evt_rd_frequence_semaine").prop('checked')) {
            $("#evt_id_frequence_jour, #evt_id_frequence_semaine").css({
                display: "flex"
            })
            $("#evt_id_frequence_mois, #evt_id_frequence_session").css({
                display: "none"
            })

        // si on coche "Sessions" fait apparaitre la div session, fait disparaitre les autres
        } else if ($("#evt_rd_frequence_session").prop('checked')) {
            $("#evt_id_frequence_jour, #evt_id_frequence_semaine, #evt_id_frequence_mois").css({
                display: "none"
            });
            $("#evt_id_frequence_session").css({
                display: "flex"
            });

        // si on coche "Mensuelle" fait apparaitre la div mois, fait disparaitre les autres
        } else{
            $("#evt_id_frequence_jour, #evt_id_frequence_semaine, #evt_id_frequence_session").css({
                display: "none"
            });
            $("#evt_id_frequence_mois").css({
                display: "flex"
            });
        }

    });

    $("#evt_chk_frequence_mois_all").on("change", function() {
        if ($(this).prop('checked')) {
            $("input[name=evt_frequence_mois]").prop("checked", true);
        } else {
            $("input[name=evt_frequence_mois]").prop("checked", false);
        }
    });

    $("#ajout_document_checkbox").on("change", function() {
        if ($(this).prop('checked')) {
            $("#ajout_doc").css({
                display: "flex"
            });
        } else {
            $("#ajout_doc").css({
                display: "none"
            });
        }
    });

    // fonction qui déploit l'explorateur de contacts
    $("#evt_chk_concerne_autres").on("change", function() {
        evt_LargeurFenetreContentRd = $("#content-rd").width();
        evt_HauteurContentRd = $("#content-rd").height();

        if ($(this).prop("checked")) {
            $("#evt_fieldset_selection_destinataire").css({
                display: "flex"
            });
            $("#evt_fieldset_selection_destinataire").css({
                width: (evt_LargeurFenetreContentRd * 0.33) + "px",
            });
            $("#evt_div_partie_gauche").css({
                width: (evt_LargeurFenetreContentRd * 0.66) + "px"
            });
         
        } else {
            $("#evt_fieldset_selection_destinataire :checkbox").prop("checked", false);

            $("#evt_fieldset_selection_destinataire").css({
                display: "none"
            });
            $("#evt_div_partie_gauche, #evt_id_fieldset_periodicite, #evt_id_renseign_gene, #fieldset_ajout_document").css({
                width: (evt_LargeurFenetreContentRd * 0.99) + "px"
            });
        }
    });
    
    // **********************
    // Fin fonctions MeF CSS
    // **********************
    
    // fonctions gérant l'arbre de choix

    // partie pour déplier l'arbo sans check
    $("#function_tree_menu img").on('click', function(){
        var selecteur = $(this).parents("li").next("ul");
        var testSelec = selecteur.attr('id');

        if( $(this).attr('src') == 'img/evt_fleche_bas.png'){
            selecteur.css({
                display: "flex",
                flexDirection: "column"
            })
            $(this).attr('src', 'img/evt_fleche_haut.png');
        }else{
            selecteur.css({
                display: "none"
            }) 
            $(this).attr('src', 'img/evt_fleche_bas.png');
        }
    })

    // partie check + deploiement
    $(".evt_chk_all").on('change', function(){
        var selecteurDeploiement = $(this).parents("li").next("ul");
        var selecteurCheck = selecteurDeploiement.find("input:checkbox");
        var displayChild = selecteurCheck.val();

        if(displayChild != 1){
            selecteurDeploiement.css({
                display: "flex",
                flexDirection: "column"
            })
            selecteurCheck.val(1);
            selecteurCheck.prop('checked', true)
            $(this).siblings("img").attr('src', 'img/evt_fleche_haut.png');
        }else{
            selecteurDeploiement.css({
                display: "none"
            }) 
            selecteurCheck.val(0);
            selecteurCheck.prop('checked', false)
            $(this).siblings("img").attr('src', 'img/evt_fleche_bas.png');
        }
    })

    $("#function_tree_menu input").on('click', function(){
        var i;
        var evt_verif = 0;

        var chkChecked = $(this).prop('checked');

        if(chkChecked){
            var evt_nbChild = $(this).parent("li").parent("ul").children("li").length
            console.log(1);
            var selecteur = $(this).parent("li").parent("ul").children().eq(i).children("input");
            console.log(selecteur);
            console.log(selecteur.val());
            for(i = 0; i < evt_nbChild; i++){
                if($(this).parent("li").parent("ul").children().eq(i).children("input").val()){
                    evt_verif++; 
                    console.log(evt_verif);
                }
            }
            
            if(evt_verif == evt_nbChild){
                $(this).parent().prop("checked", true);
            }
        }
    })

    // var test = "";
    // $("#function_tree_menu input").on('click', function(){

    //     if($(this).prop('checked')){
    //         test += $(this).attr('id');
    //     }
    //     console.log(test);
    //     $('#ReceiverList').val(test);
    // });

    // *************************************
    // Fin fonctions gérant l'arbre de choix
    // *************************************

    // **************************************************************************
    // Debut fonction pour la transmission des donn�es utilisateurs destinataires
    // **************************************************************************
    // var input_hidden = [];
    // input_hidden[] = newArray();
    
    // $('.evt_chk_all').on('change', function(){
    
    //    spliceText = $(this).attr('id');
    //    spliceCara = "-";
    //    splitString(spliceText, spliceCara);

    //    input_hidden[splitString[1]]=splitString[0];
       
       
    //    $('#ReceiverList').val(input_hidden);
    // });
    
   // ************************************************************************
   // Fin fonction pour la transmission des donn�es utilisateurs destinataires
   // ************************************************************************

    // *********************************************************
    // Debut fonctions pour l'affichage des fichiers selctionnés
    // *********************************************************
    
    // initialisation du premier input
    var evt_input_file = [];

    evt_input_file[0] = "<input type=\"file\" name=\"evt_file\" id=\"evt_file_0\">";
    var evt_cpteur_input_file = 0;

    $('#nb_files').html(evt_cpteur_input_file+1);
    $('#evt_btn_input_file').html(evt_input_file);
    
    // Fonction d'ajout d'input
    $("#evt_add_input_file").on('click', function(){
        evt_cpteur_input_file++;
        evt_input_file[evt_cpteur_input_file] = "<input type=\"file\" name=\"evt_file\" id=\"evt_file_"+evt_cpteur_input_file+"\">";
        
        $('#evt_btn_input_file').html(evt_input_file);
        $('#nb_files').html(evt_cpteur_input_file+1);
        
        if(evt_cpteur_input_file+1 > 1){
            $('#evt_pluriel_files').html('s');
        }
            
    });
    
    // Fonction de suppression d'input
    $("#evt_delete_input_file").on('click', function(){
        evt_input_file[evt_cpteur_input_file] = "";
        $('#evt_btn_input_file').html(evt_input_file);
        
        evt_cpteur_input_file--;
        $('#nb_files').html(evt_cpteur_input_file+1);
        
        if(evt_cpteur_input_file+1 < 2){
            $('#evt_pluriel_files').html('');
        }
    });
    
})
        
    function functionSelectFiles(fileInput) {
        var files = fileInput.files;

        var evt_msg_list_files = "<div>" + files.length + " fichiers sélectionnés:</div>";

        for (var i = 0; i < files.length; i++) {
            evt_msg_list_files += "<div><form>- " + files[i].name+ "<input type=\"submit\" value=\"supprimer\" name=\"evt_suppr_doc_"+i+"\" id=\"evt_suppr_doc_"+i+"\"\"></form></div>";
        }

        $('#evt_tab_import_fichier').html(evt_msg_list_files);
    }
    

    // *******************************************************
    // Fin fonctions pour l'affichage des fichiers selctionnés
    // *******************************************************
    
    
