import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1Ijoiaml5YW1ha2hpamEiLCJhIjoiY21hcHRiZWxoMDI4NjJub2U0b29ob3U3eCJ9.nANVhMVg44u8rXx0KBlXgQ';

const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-71.09415, 42.36027], // [longitude, latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18, // Maximum allowed zoom
  });

  function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
  }
  let timeFilter = -1; 
  function formatTime(minutes) {
    const date = new Date(0, 0, 0, 0, minutes); 
    return date.toLocaleString('en-US', { timeStyle: 'short' });
    }

  map.on('load', async () => {
    let stations; 
  
    // Boston
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });
  
    map.addLayer({
      id: 'bike-lanes',
      type: 'line',
      source: 'boston_route',
      paint: {
        'line-color': '#FF00FF', // magenta
        'line-width': 3,
        'line-opacity': 0.4,
      },
    });
  
    // Cambridge
    map.addSource('cambridge_route', {
      type: 'geojson',
      data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
    });
  
    map.addLayer({
      id: 'bike-lanes-cambridge',
      type: 'line',
      source: 'cambridge_route',
      paint: {
        'line-color': '#FF00FF',
        'line-width': 3,
        'line-opacity': 0.4,
      },
    });
  
    try {
      const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
      const jsonData = await d3.json(jsonurl);
      stations = jsonData.data.stations;
  
      const trips = await d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv');
      const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
      const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);
  
      stations = stations.map((station) => {
        const id = station.short_name;
        station.departures = departures.get(id) ?? 0;
        station.arrivals = arrivals.get(id) ?? 0;
        station.totalTraffic = station.departures + station.arrivals;
        return station;
      });
  
      const radiusScale = d3
        .scaleSqrt()
        .domain([0, d3.max(stations, (d) => d.totalTraffic)])
        .range([0, 25]);
  
      const svg = d3.select('#map').select('svg');
  
      const circles = svg
        .selectAll('circle')
        .data(stations)
        .enter()
        .append('circle')
        .attr('r', d => radiusScale(d.totalTraffic)) 
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6)
        .style('pointer-events', 'auto')
        .each(function (d) {
            d3.select(this)
            .append('title')
            .text(
                `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`
            );
        });
  
      function updatePositions() {
        circles
          .attr('cx', (d) => getCoords(d).cx)
          .attr('cy', (d) => getCoords(d).cy);
      }
  
      updatePositions();
  
      map.on('move', updatePositions);
      map.on('zoom', updatePositions);
      map.on('resize', updatePositions);
      map.on('moveend', updatePositions);

    const timeSlider = document.getElementById('time-slider');
    const selectedTime = document.getElementById('selected-time');
    const anyTimeLabel = document.getElementById('any-time');

    function updateTimeDisplay() {
    timeFilter = Number(timeSlider.value);

    if (timeFilter === -1) {
        selectedTime.textContent = '';
        selectedTime.style.display = 'none';
        anyTimeLabel.style.display = 'block';
    } else {
        selectedTime.textContent = formatTime(timeFilter);
        selectedTime.style.display = 'block';
        anyTimeLabel.style.display = 'none';
    }
    }

timeSlider.addEventListener('input', updateTimeDisplay);
updateTimeDisplay(); 
  
    } catch (error) {
      console.error('Error loading data', error);
    }
  
    console.log("Map & bike lanes fully loaded.");
  });