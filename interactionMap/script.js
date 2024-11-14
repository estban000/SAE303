// Initialisation de la carte centrée sur la région de l'Académie de Versailles
const map = L.map('map').setView([48.8, 2.1], 9);

// Couche de tuiles OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sélection de la zone d'information
const infoBox = document.getElementById('informationDonnee');

// Variable pour stocker les marqueurs et éviter d'ajouter plusieurs fois
let establishmentMarkers = [];

// Structure pour stocker le nombre d'établissements publics et privés par département
const departmentStats = {};

// Fonction pour mettre à jour les statistiques par département
function updateDepartmentStats(etablissement) {
    const deptName = etablissement.libelle_departement;

    if (!departmentStats[deptName]) {
        departmentStats[deptName] = { public: 0, prive: 0 };
    }

    if (etablissement.secteur === "PUBLIC") {
        departmentStats[deptName].public += 1;
    } else if (etablissement.secteur === "PRIVE SOUS CONTRAT") {
        departmentStats[deptName].prive += 1;
    }
}

// Chargement des données des établissements
fetch('effectifs-en-terminale-specialites-academie-versailles-2022(1).json')
    .then(response => response.json())
    .then(data => {
        // Mise à jour des statistiques par département
        data.forEach(etablissement => {
            updateDepartmentStats(etablissement);
        });

        // Fonction pour mettre en évidence les départements de l'Académie de Versailles
        function highlightAcademy(feature) {
            const departementAcademie = ["Yvelines", "Essonne", "Hauts-de-Seine", "Val-d'Oise"];
            if (departementAcademie.includes(feature.properties.nom)) {
                return {
                    color: "black",
                    weight: 2,
                    fillColor: "blue",
                    fillOpacity: 0.2
                };
            } else {
                return {
                    color: "black",
                    weight: 1,
                    fillColor: "gray",
                    fillOpacity: 0.01
                };
            }
        }

        // Fonction pour afficher les marqueurs pour un département
        function showMarkersForDepartment(departmentName) {
            // Effacer les marqueurs précédemment ajoutés
            establishmentMarkers.forEach(marker => marker.remove());
            establishmentMarkers = []; // Réinitialiser le tableau des marqueurs

            // Ajouter les marqueurs pour le département sélectionné
            data.forEach(etablissement => {
                if (etablissement.libelle_departement === departmentName) {
                    const { latitude, longitude, appellation_officielle, secteur, effectif_total } = etablissement;
                    
                    // Crée un marqueur pour chaque établissement
                    const marker = L.marker([latitude, longitude]).addTo(map);
                    establishmentMarkers.push(marker); // Ajouter le marqueur au tableau

                    // Ajoute un événement de survol pour afficher les informations
                    marker.on('mouseover', function () {
                        infoBox.innerHTML = `
                            <b>${appellation_officielle}</b><br>
                            Type : ${secteur}<br>
                            Effectif Total : ${effectif_total}
                        `;
                    });

                    // Ajoute un événement de clic pour afficher plus d'informations
                    marker.on('click', function () {
                        infoBox.innerHTML = `
                            <b>${appellation_officielle}</b><br>
                            Type : ${secteur}<br>
                            Effectif Total : ${effectif_total}
                        `;
                    });
                }
            });
        }

        // Fonction pour changer le style au survol et afficher les informations dans le infoBox
        function highlightFeature(e) {
            const layer = e.target;
            const deptName = layer.feature.properties.nom;
            const stats = departmentStats[deptName] || { public: 0, prive: 0 };

            // Afficher les informations du département dans la zone infoBox
            infoBox.innerHTML = `
                <b>Département :</b> ${deptName}<br>
                <b>Établissements publics :</b> ${stats.public}<br>
                <b>Établissements privés :</b> ${stats.prive}
            `;
        }

        // Fonction pour rétablir le style initial et vider le infoBox
        function resetHighlight(e) {
            const layer = e.target;
            geojson.resetStyle(layer);
            infoBox.innerHTML = "Survolez un département pour voir les informations";
        }

        // Fonction pour zoomer sur le département lors d'un clic
        function zoomToFeature(e) {
            const layer = e.target;

            // Zoomer sur le département
            map.fitBounds(layer.getBounds());

            // Récupère le nom du département
            const deptName = layer.feature.properties.nom;

            // Afficher les marqueurs pour le département sélectionné
            showMarkersForDepartment(deptName);
        }

        // Fonction pour attacher les événements de survol, de clic et de popup à chaque département
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        // Chargement du fichier GeoJSON contenant tous les départements
        const geojsonUrl = "https://france-geojson.gregoiredavid.fr/repo/regions/ile-de-france/departements-ile-de-france.geojson";

        // Ajout du GeoJSON sur la carte avec le style conditionnel et événements
        const geojson = new L.GeoJSON.AJAX(geojsonUrl, {
            style: highlightAcademy,
            onEachFeature: onEachFeature
        }).addTo(map);

    })
    .catch(error => console.error("Erreur de chargement des données : ", error));
