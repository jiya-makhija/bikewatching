import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';


mapboxgl.accessToken = 'pk.eyJ1Ijoiaml5YW1ha2hpamEiLCJhIjoiY21hcHRiZWxoMDI4NjJub2U0b29ob3U3eCJ9.nANVhMVg44u8rXx0KBlXgQ';

const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-71.09415, 42.36027], // [longitude, latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18, // Maximum allowed zoom
  });
