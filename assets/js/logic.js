// Mapping Earthquakes > magnitude 2.5 for past month
// Store our API endpoint inside queryUrls
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";
const queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// function to assign colors of earthquakes based on magnitude
function circleColor(mag) {
  if (mag > 6) {
    return "#f30"
  } else if (mag > 5) {
    return "#f60"
  } else if (mag > 4) {
    return "#f90"
  } else if (mag > 3) {
    return "#fc0"
  } else if (mag > 2) {
    return "#ff0"
  } else {
    return "#9f3"
  }
}
// function to assign size of circle based on magnitude
function circleSize(mag) {
  return mag * 1.5 }

const earthquakes = new L.LayerGroup();

// Perform a GET request to the query URL
// Once we get a response, send the data.features object to the createFeatures function
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
// Give each feature a popup describing the magnitude, place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h5>" + "Magnitude: " + feature.properties.mag + "</h5><hr><p>" + feature.properties.place +
    "</h5><hr><p>" + new Date(feature.properties.time) + "</p>")
    .addTo(earthquakes);
    };

// Create a GeoJSON layer to display circle markers
    L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: (function (feature, latlng) {
        return L.circleMarker(latlng, {
          fillOpacity: 0.75,
          color: "#000",
          stroke: true,
          weight: .8,
          fillColor: circleColor(feature.properties.mag),
          radius: circleSize(feature.properties.mag)
        })
      })
    })
    .addTo(earthquakes);
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

const plates = new L.LayerGroup();
// Perform a GET request to the query URL
// Once we get a response, send the data.features object to the createFeatures function
d3.json(queryUrl2, function (geoJson) {
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 1,
                color: "red",
                fillOpacity: 0
            }
        }
    })
    .addTo(plates);
  });

function createMap() {

  // Define basemaps layers: street, dark, satellite
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
    });

  const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
    });

  const satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
    });

  // Define a baseMaps object to hold our base layers
  const baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  };


  // Create overlay object to hold our overlay layer
  const overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Create our map, giving it the streetmap, darkmap, satellite, earthquakes and plates layers to display on load
  const myMap = L.map("map", {
    center: [48.10, -100.10],
    zoom: 3,
    layers: [streetmap, darkmap, satellitemap, earthquakes, plates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create an earthquake magnitude color legend to be displayed on the map
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
      grades = [2, 3, 4, 5, 6],
      labels = [];

      div.innerHTML+='Magnitude<br>'

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
      };
            legend.addTo(myMap);
}
