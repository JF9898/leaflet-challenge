// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL to retrieve the data. 
d3.json(queryUrl).then(function (data) {
  // Console log the data retrieved to ensure the data was properly retrieved.
  console.log(data);
  // Once there is a response, send the data.features object to the createFeatures function to create the markers.
  createFeatures(data.features);
});

// Function to determine marker size
function markerSize(magnitude) {
  return magnitude * 10000;
};

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

  // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Point to layer used to alter markers
    pointToLayer: function(feature, latlong) {

      // Determine the style of markers based on properties of the earthquake data
      var markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: ColorScale(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        stroke: true,
        weight: 0.5
      }
      return L.circle(latlong,markers);
    }
  });

  // Send the earthquakes layer to create the map using createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create tile layer that will be the background of our map, grayscale mapbox style from mapbox.com API
  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style:    'mapbox/light-v11',
    access_token: api_key
  });

  // create the map object with options and layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 10,
    layers: [grayscale, earthquakes]
  });

  // Create a legend for the depth of the earthquakes, store it in the bottom left of the page and add it to the map
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
};