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
let selectedDepartment = null; // Variable pour garder trace du département sélectionné

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
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        // Mise à jour des statistiques par département
        data.forEach(function(etablissement) {
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
            establishmentMarkers.forEach(function(marker) {
                marker.remove();
            });
            establishmentMarkers = []; // Réinitialiser le tableau des marqueurs

            // Ajouter les marqueurs pour le département sélectionné
            data.forEach(function(etablissement) {
                if (etablissement.libelle_departement === departmentName) {
                    const { latitude, longitude, appellation_officielle, secteur, effectif_total, effectif_total_garcons, effectif_total_filles, date_ouverture } = etablissement;

                    // Définir des icônes colorées pour public et privé
                    const markerIcon = L.circleMarker([latitude, longitude], {
                        radius: 4,
                        fillColor: secteur === "PUBLIC" ? "blue" : "orange",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.7
                    }).addTo(map);

                    establishmentMarkers.push(markerIcon); // Ajouter le marqueur au tableau

                    // Ajoute un événement de clic pour afficher les informations dans un pop-up
                    markerIcon.on('click', function() {
                        markerIcon.bindPopup(`
                            <b>${appellation_officielle}</b><br><br>
                            <b>Date d'Ouverture :</b> ${date_ouverture || "Non spécifiée"}<br>
                            <b>Type :</b> ${secteur}<br>
                            <b>Effectif Total :</b> ${effectif_total}<br>
                            <b>Effectifs Garçons :</b> ${effectif_total_garcons || "Non spécifié"}<br>
                            <b>Effectifs Filles :</b> ${effectif_total_filles || "Non spécifié"}<br>
                        `).openPopup();
                    });
                }
            });
        }

        // Fonction pour mettre en évidence les départements au survol et afficher les informations dans l'infoBox
        function highlightFeature(e) {
            const layer = e.target;
            const deptName = layer.feature.properties.nom;
            const stats = departmentStats[deptName] || { public: 0, prive: 0 };

            // Afficher les informations du département dans la zone infoBox
            infoBox.innerHTML = `
                <b>Département :</b> ${deptName}<br>
                <b>Établissements publics :</b> ${stats.public} 
                <span style="background-color: blue; color: white; padding: 2px 5px; border-radius: 3px;">PUBLIC</span><br><br>
                <b>Établissements privés :</b> ${stats.prive} 
                <span style="background-color: orange; color: white; padding: 2px 5px; border-radius: 3px;">PRIVÉ</span>
            `;
        }

        // Fonction pour rétablir la surbrillance et réinitialiser l'infoBox lors du survol de départements
        function resetHighlight(e) {
            const layer = e.target;

            // Si un département est déjà sélectionné, ne pas réinitialiser son style
            if (selectedDepartment && selectedDepartment === layer) return;

            geojson.resetStyle(layer);
            infoBox.innerHTML = "Survolez un département pour voir les informations";
        }

        // Fonction pour zoomer sur le département lors d'un clic et garder l'infoBox active
        function zoomToFeature(e) {
            const layer = e.target;

            // Si un département est déjà sélectionné, réinitialiser son style
            if (selectedDepartment) {
                geojson.resetStyle(selectedDepartment);
            }

            // Zoomer sur le département
            map.fitBounds(layer.getBounds());

            // Mettre à jour la variable selectedDepartment
            selectedDepartment = layer;

            // Modifier le style du département sélectionné pour enlever la couleur de remplissage
            selectedDepartment.setStyle({
                color: "black",
                weight: 2,
                fillColor: "none",  // Enlève la couleur de remplissage
                fillOpacity: 0      // Rendre le remplissage complètement transparent
            });

            // Afficher les informations du département sélectionné dans la zone infoBox
            const deptName = layer.feature.properties.nom;
            const stats = departmentStats[deptName] || { public: 0, prive: 0 };
            infoBox.innerHTML = `
                <b>Département :</b> ${deptName}<br>
                <b>Établissements publics :</b> ${stats.public} 
                <span style="background-color: blue; color: white; padding: 2px 5px; border-radius: 3px;">PUBLIC</span><br><br>
                <b>Établissements privés :</b> ${stats.prive} 
                <span style="background-color: orange; color: white; padding: 2px 5px; border-radius: 3px;">PRIVÉ</span>
            `;

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
    .catch(function(error) {
        console.error("Erreur de chargement des données : ", error);
    });
