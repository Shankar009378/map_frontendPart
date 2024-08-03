import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import './Map.css';
import axios from 'axios';
import * as THREE from 'three';

mapboxgl.accessToken = "pk.eyJ1Ijoic3ViaGFtcHJlZXQiLCJhIjoiY2toY2IwejF1MDdodzJxbWRuZHAweDV6aiJ9.Ys8MP5kVTk5P9V2TDvnuDg";

const Map = () => {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true
    });

    function successLocation(position) {
      setupMap([position.coords.longitude, position.coords.latitude]);
    }

    function errorLocation() {
      setupMap([-2.24, 53.48]);
    }

    function setupMap(center) {
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 15
      });

      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav);

      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
      });

      map.addControl(directions, 'top-left');

      directions.on('route', async (e) => {
        const route = e.route[0];
        const { origin, destination, waypoints } = {
          origin: route.legs[0].steps[0].maneuver.location,
          destination: route.legs[0].steps[route.legs[0].steps.length - 1].maneuver.location,
          waypoints: route.legs[0].steps.map(step => step.maneuver.location),
        };

        // Save route to backend
        await axios.post('https://map-backendpart.onrender.com/api/routes', { origin, destination, waypoints });

        // Animate car icon
        animateCar(map, waypoints);
      });
    }

    function animateCar(map, waypoints) {
      const car = document.createElement('div');
      car.className = 'car-icon';
      const marker = new mapboxgl.Marker(car).setLngLat(waypoints[0]).addTo(map);

      let counter = 0;
      const interval = setInterval(() => {
        if (counter >= waypoints.length - 1) {
          clearInterval(interval);
        } else {
          marker.setLngLat(waypoints[counter]);
          counter++;
        }
      }, 2000);
    }

  }, []);
  
  return (
    <div>
      <div id="map" style={{ width: '100%', height: '100vh' }}></div>
    </div>
  );
};

export default Map;
