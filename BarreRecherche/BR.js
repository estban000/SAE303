// Sélectionner les éléments HTML
const searchBar = document.getElementById('search-bar');
const resultContainer = document.getElementById('result-container');

// Vérifiez que les éléments HTML existent
if (!searchBar) {
    console.error('Élément avec l\'ID "search-bar" introuvable dans le HTML.');
} else {
    console.log('Élément "search-bar" trouvé.');
}

if (!resultContainer) {
    console.error('Élément avec l\'ID "result-container" introuvable dans le HTML.');
} else {
    console.log('Élément "result-container" trouvé.');
}
// Charger les données JSON
let data = []; // Variable pour stocker les données

fetch('effectifs-en-terminale-specialites-academie-versailles-2022(1).json')
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) { // Utilisation d'un nom différent pour éviter le conflit
        console.log('Données JSON chargées :', jsonData); // Vérifiez les données dans la console
        data = jsonData; // Mettre à jour la variable globale
    })
    .catch(function(error) {
        console.error('Erreur lors du chargement du fichier JSON :', error);
    });

// Fonction pour rechercher des établissements
function searchEstablishments(query) {
    // Nettoyer les résultats précédents
    resultContainer.innerHTML = '';

    // Filtrer les établissements par le nom
    const filteredEstablishments = data.filter(etablissement =>
        etablissement.appellation_officielle.toLowerCase().includes(query.toLowerCase())
    );

    // Si aucun résultat n'est trouvé
    if (filteredEstablishments.length === 0) {
        resultContainer.innerHTML = `<p>Aucun résultat trouvé.</p>`;
        return;
    }

    // Afficher les résultats
    filteredEstablishments.forEach(etablissement => {
        const { appellation_officielle, secteur, date_ouverture, effectif_total, effectif_total_garcons, effectif_total_filles } = etablissement;

        // Ajouter chaque résultat dans la div
        const resultHTML = `
            <div class="result-item">
                <h3>${appellation_officielle}</h3>
                <p><b>Date d'ouverture :</b> ${date_ouverture || 'Non spécifiée'}</p>
                <p><b>Type :</b> ${secteur}</p>
                <p><b>Effectif total :</b> ${effectif_total || 'Non spécifié'}</p>
                <p><b>Effectifs garçons :</b> ${effectif_total_garcons || 'Non spécifié'}</p>
                <p><b>Effectifs filles :</b> ${effectif_total_filles || 'Non spécifié'}</p>
            </div>
            <hr>
        `;

        resultContainer.innerHTML += resultHTML;
    });
}

// Ajouter un événement à la barre de recherche
searchBar.addEventListener('input', (e) => {
    const query = e.target.value;
    console.log('Recherche pour :', query); // Vérifiez que cet événement se déclenche
    searchEstablishments(query);
});
