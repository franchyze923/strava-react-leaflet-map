import React, {useEffect, useState} from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import './App.css';
import teslaData from "./data/tesla-sites.json"
import axios from 'axios';

function App() {

  interface Node {
    name: string;
    id: number;
    end_latlng: number[];
  }

  const [nodes, setNodes] = useState<Node[]>([]);

  const clientID = "43995";
  const clientSecret = "6b583c87a9969f7cc66c7b6b0cff643b820bb135";
  const refreshToken = "98b596ec1ce3a93f6cda9515ee3cb430d259e946"
  const auth_link = "https://www.strava.com/oauth/token"
  const activities_link = `https://www.strava.com/api/v3/athlete/activities`

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(`${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`)
      ]);

      console.log(stravaAuthResponse)
      const stravaActivityResponse = await axios.get(`${activities_link}?access_token=${stravaAuthResponse[0].data.access_token}`);
      console.log(stravaActivityResponse.data[0]);
      setNodes(stravaActivityResponse.data);
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

      {nodes.map(activity => (
        <Marker key = {activity.id} position={[activity.end_latlng[0], activity.end_latlng[1]]}>
          {/* <Popup position={[activity.end_latlng[0], activity.end_latlng[1]]}>
            <div>
              <h2>{"Name: " + tsla.name}</h2>
              <p>{"Status: " + tsla.status}</p>
              <p>{"Number of Charging Stations: " + tsla.stallCount}</p>
            </div>
          </Popup> */}
        </Marker>
      ))}
    </MapContainer>
  );
}

export default App;
