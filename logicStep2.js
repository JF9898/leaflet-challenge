// Store our API endpoint as queryUrl and tectonicplatesUrl for the tectonic plates data.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL to retrieve the data.
d3.json(queryUrl).then(function (data) {
  // Console log the data retrieved to ensure the data was properly retrieved.
  console.log(data);
  // Once there is a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Function to determine marker color by depth
function ColorScale(depth){
  if (depth < 10) return "#00FF00";
  else if (depth < 30) return "greenyellow";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "red";
  else return "#FF0000";
}

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Point to layer used to alter markers
    pointToLayer: function(feature, latlong) {

      // Determine the style of markers based on properties
      var markers = {
        radius: feature.properties.mag * 10000,
        fillColor: ColorScale(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        weight: 0.5
      }
      return L.circle(latlong,markers);
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create tile layers for the different map styles. 
  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/satellite-v9',
    access_token: api_key
  });
  
  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/light-v11',
    access_token: api_key
  });

  var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/outdoors-v12',
    access_token: api_key
  });

  // Create layer for tectonic plates data
  tectonicPlates = new L.layerGroup();

    // Perform a GET request to the tectonicplatesURL to retrieve the data.
    d3.json(tectonicplatesUrl).then(function (plates) {

        // Console log the data retrieved to ensure the data was properly retrieved.
        console.log(plates);
        L.geoJSON(plates, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
    });

    // Create a baseMaps object. for the satellite, grayscale, and outdoors layers.
    var baseMaps = {
        "- Satellite": satellite,
        "- Grayscale": grayscale,
        "- Outdoors": outdoors
    };

    // Create an overlay object to hold our overlay. Only one overlay is visible at a time.
    var overlayMaps = {
        "- Earthquakes": earthquakes,
        "- Tectonic Plates": tectonicPlates
    };
    
    // Create map to give it the satellite map and earthquakes layers to display on load. 
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite, earthquakes, tectonicPlates]
  });

  // Add legend in the bottom left corner of the map
  var legend = L.control({position: "bottomleft"});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
      '<i style="background:' + ColorScale(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap)

  // Create a layer control that contains our baseMaps and overlayMaps.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map and set the default layers to be displayed.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
};
