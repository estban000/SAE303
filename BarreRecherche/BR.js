// Sélectionner les éléments HTML
const searchBar = document.getElementById('search-bar');
const resultContainer = document.getElementById('result-container');
const departmentFilter = document.getElementById('department-filter');

// Vérification des éléments HTML
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

if (!departmentFilter) {
    console.error('Élément avec l\'ID "department-filter" introuvable dans le HTML.');
} else {
    console.log('Élément "department-filter" trouvé.');
}

// Charger les données JSON
let data = [];

fetch('effectifs-en-terminale-specialites-academie-versailles-2022(1).json')
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        console.log('Données JSON chargées :', jsonData);
        data = jsonData;

        // Remplir le menu déroulant avec les départements disponibles
        populateDepartmentFilter();
    })
    .catch(function(error) {
        console.error('Erreur lors du chargement du fichier JSON :', error);
    });

// Remplir le menu déroulant des départements
function populateDepartmentFilter() {
    // Extraire les départements uniques
    const departments = [...new Set(data.map(etablissement => etablissement.libelle_departement))];

    // Ajouter chaque département comme option
    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });
}

// Fonction pour rechercher des établissements
function searchEstablishments(query, departmentName) {
    // Nettoyer les résultats précédents
    resultContainer.innerHTML = '';

    // Filtrer les établissements par le nom et le département
    const filteredEstablishments = data.filter(etablissement => {
        const matchQuery = etablissement.appellation_officielle.toLowerCase().includes(query.toLowerCase());
        const matchDepartment = etablissement.libelle_departement === departmentName || departmentName === '';
        return matchQuery && matchDepartment;
    });

    // Si aucun résultat n'est trouvé
    if (filteredEstablishments.length === 0) {
        resultContainer.innerHTML = `<p>Aucun résultat trouvé.</p>`;
        return;
    }

    // Afficher les résultats
    filteredEstablishments.forEach(etablissement => {
        const { appellation_officielle, secteur, date_ouverture, effectif_total, effectif_total_garcons, effectif_total_filles } = etablissement;

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
    const departmentName = departmentFilter.value; // Département sélectionné
    searchEstablishments(query, departmentName);
});

// Ajouter un événement pour le filtre de département
departmentFilter.addEventListener('change', (e) => {
    const departmentName = e.target.value;
    const query = searchBar.value; // Texte de recherche
    searchEstablishments(query, departmentName);
});
