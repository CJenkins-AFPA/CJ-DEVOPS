let ligneEnModification = null;

function ajouterLigne() {
    const tbody = document.querySelector("#tbodyPieces");
    
    // Récupérer les valeurs des champs du formulaire
    const nomPiece = document.querySelector("#nom_piece").value.trim();
    const typeDePiece = document.querySelector("#type_de_piece").value.trim();
    const marque = document.querySelector("#marque").value.trim();
    const prix = parseFloat(document.querySelector("#prix").value.trim());
    const quantite = parseInt(document.querySelector("#quantite").value.trim());

    // Validation basique des champs
    if (!nomPiece || !typeDePiece || !marque || isNaN(prix) || isNaN(quantite)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    // Si une ligne est en cours de modification
    if (ligneEnModification) {
        // Mettre à jour la ligne avec les nouvelles valeurs
        ligneEnModification.querySelector('td:nth-child(1)').textContent = nomPiece;
        ligneEnModification.querySelector('td:nth-child(2)').textContent = typeDePiece;
        ligneEnModification.querySelector('td:nth-child(3)').textContent = marque;
        ligneEnModification.querySelector('td:nth-child(4)').textContent = prix.toFixed(2);
        ligneEnModification.querySelector('td:nth-child(5)').textContent = quantite;

        // Réinitialiser l'état de modification
        ligneEnModification = null;
    } else {
        // Créer une nouvelle ligne
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${nomPiece}</td>
            <td>${typeDePiece}</td>
            <td>${marque}</td>
            <td>${prix.toFixed(2)}</td>
            <td>${quantite}</td>
            <td>
                <button type="button" class="btn btn-warning btn-sm" onclick="editLigne(this)">Modifier</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteLigne(this)">Supprimer</button>
            </td>
        `;
        tbody.appendChild(newRow);
    }

    // Réinitialiser le formulaire
    document.querySelector("#formPiece").reset();
}

function editLigne(button) {
    const row = button.parentElement.parentElement;

    // Passer les cellules en mode édition
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
        if (index < 5) { // Ne pas éditer la cellule des actions
            const currentValue = cell.textContent;
            const inputType = (index === 3 || index === 4) ? 'number' : 'text';
            cell.innerHTML = `<input type="${inputType}" value="${currentValue}" style="width: 100%">`;
        }
    });

    // Changer le bouton "Modifier" en "Enregistrer"
    button.textContent = "Enregistrer";
    button.className = "btn btn-success btn-sm";
    button.setAttribute('onclick', 'saveLigne(this)');
}

function saveLigne(button) {
    const row = button.parentElement.parentElement;

    // Enregistrer les nouvelles valeurs des cellules
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
        if (index < 5) { // Ne pas enregistrer la cellule des actions
            const input = cell.querySelector('input');
            cell.textContent = input.value.trim();
        }
    });

    // Remettre le bouton "Enregistrer" en "Modifier"
    button.textContent = "Modifier";
    button.className = "btn btn-warning btn-sm";
    button.setAttribute('onclick', 'editLigne(this)');
}

function deleteLigne(button) {
    // Supprimer la ligne du tableau
    const row = button.parentElement.parentElement;
    row.remove();
}