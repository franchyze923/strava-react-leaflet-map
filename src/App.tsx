import React, {useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import './App.css';
import teslaData from "./data/tesla-sites.json"
import axios from 'axios';

function App() {

  useEffect(() => {
    async function fetchData() {
      const stravaResponse = await axios.all([
        // this token was generated after getting a new authoirzation code which gave us read_all permission. 
        axios.get("https://www.strava.com/api/v3/athlete/activities?access_token={your token with read_all permission}")
      ]);
      console.log(stravaResponse)
    }
    fetchData();
  }, []);

const filteredStations = teslaData.filter(tsla => tsla.address.country === "Italy")

  return (
    <MapContainer center={[42.585444, 13.257684]} zoom={6} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {filteredStations.map(tsla => (
        <Marker key = {tsla.id} position={[tsla.gps.latitude, tsla.gps.longitude]}>
          <Popup position={[tsla.gps.latitude, tsla.gps.longitude]}>
            <div>
              <h2>{"Name: " + tsla.name}</h2>
              <p>{"Status: " + tsla.status}</p>
              <p>{"Number of Charging Stations: " + tsla.stallCount}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default App;
