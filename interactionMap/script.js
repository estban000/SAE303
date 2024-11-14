// Initialisation de la carte centrée sur la région de l'Académie de Versailles
const map = L.map('map').setView([48.8, 2.1], 9);

// Couche de tuiles OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sélection de la zone d'information
const infoBox = document.getElementById('informationDonnee');

// Variable pour stocker le département sélectionné
let selectedLayer = null;

// Style pour mettre en évidence les départements de l'Académie de Versailles
function highlightAcademy(feature) {
    const departementAcademie = ["Yvelines", "Essonne", "Hauts-de-Seine", "Val-d'Oise"];
    
    if (departementAcademie.includes(feature.properties.nom)) {
        return {
            color: "black",      // Couleur des frontières
            weight: 2,
            fillColor: "blue",   // Couleur de remplissage
            fillOpacity: 0.2
        };
    } else {
        return {
            color: "black",
            weight: 1,
            fillColor: "gray", // Couleur de remplissage pour les autres départements
            fillOpacity: 0.01
        };
    }
}

// Fonction pour changer le style au survol et afficher les informations dans le infoBox
function highlightFeature(e) {
    const layer = e.target;
    if (layer !== selectedLayer) {  // S'assurer que le département sélectionné ne soit pas surligné
        layer.setStyle({
            weight: 3,
            color: '#666',
            fillColor: 'yellow',
            fillOpacity: 0.1
        });
    }

    // Afficher les informations du département dans la zone infoBox
    const deptName = layer.feature.properties.nom;
    infoBox.innerHTML = `<b>Département :</b> ${deptName}`;
}

// Fonction pour rétablir le style initial et vider le infoBox
function resetHighlight(e) {
    const layer = e.target;
    if (layer !== selectedLayer) {  // S'assurer que le département sélectionné garde son style modifié
        geojson.resetStyle(layer);
    }
    infoBox.innerHTML = "Survolez un département pour voir les informations";
}

// Fonction pour zoomer sur le département lors d'un clic et supprimer la surbrillance et la couleur de remplissage
function zoomToFeature(e) {
    const layer = e.target;

    // Zoomer sur le département
    map.fitBounds(layer.getBounds());

    // Si un département est déjà sélectionné, réinitialiser son style
    if (selectedLayer) {
        geojson.resetStyle(selectedLayer);
    }

    // Définir le département cliqué comme sélectionné
    selectedLayer = layer;

    // Modifier le style du département sélectionné pour enlever la couleur de remplissage
    selectedLayer.setStyle({
        color: "black",
        weight: 2,
        fillColor: "none",  // Enlève la couleur de remplissage
        fillOpacity: 0      // Rendre le remplissage complètement transparent
    });

    // Mettre à jour l'infoBox avec le nom du département sélectionné
    const deptName = layer.feature.properties.nom;
    infoBox.innerHTML = `<b>Département sélectionné :</b> ${deptName}`;
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
