import React, {useEffect, useState} from 'react';
import { MapContainer, TileLayer, Popup, Polyline } from 'react-leaflet'
import './App.css';
import axios from 'axios';
import polyline from '@mapbox/polyline'

function App() {

  interface Node {
    activityPositions: any;
    activityName: string;
    activityType: string;
    activitySpeed: string;
    activityDate: Date;
    activityHeartRate: string;
    activityColor: string;
    activityDistance: number;
  }

  const [nodes, setNodes] = useState<Node[]>([]);

  const clientID = "your client id";
  const clientSecret = "your client secret";
  const refreshToken = "your refresh token"
  const auth_link = "https://www.strava.com/oauth/token"
  const activities_link = `https://www.strava.com/api/v3/athlete/activities`

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(`${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`)
      ]);

      let looper_num = 1

      let stravaActivityResponse;

      while (true){

        let stravaActivityResponse_single = await axios.get(`${activities_link}?per_page=200&page=${looper_num}&access_token=${stravaAuthResponse[0].data.access_token}`);

          if (stravaActivityResponse_single.data.length === 0)
          {
              console.log("breaking cuz its 0")
              break;
          }

          if (stravaActivityResponse) {
            console.log("true")
            stravaActivityResponse = stravaActivityResponse.concat(stravaActivityResponse_single.data)
          }
          else{
            console.log("false")
            stravaActivityResponse = stravaActivityResponse_single.data

          }

        looper_num ++ ;
      }

      console.log(stravaActivityResponse);

      const polylines = [];
      for (let i = 0; i < stravaActivityResponse.length; i += 1) {
        const activity_polyline = stravaActivityResponse[i].map.summary_polyline;
        const activity_name = stravaActivityResponse[i].name;
        const activity_type= stravaActivityResponse[i].type;
        const activity_speed= stravaActivityResponse[i].average_speed;
        const activity_date = new Date(stravaActivityResponse[i].start_date);
        let activity_distance= stravaActivityResponse[i].distance/1609;

        let activity_heart_rate = ""
        let activity_color = "red"

        if (stravaActivityResponse[i].has_heartrate === true){
          activity_heart_rate = stravaActivityResponse[i].average_heartrate;
        }else {
          activity_heart_rate = "Heart Rate Not Recorded";
        }

        if (i === 0){
          activity_color = "white";
        }
        else if (i <10) {
          activity_color = "yellow"
        }
        else if (i <20) {
          activity_color = "blue"
        }
        else {
          activity_color = "red"
        }

        console.debug(`Activity Index: ${i} \nActivity Color: ${activity_color}`)

        polylines.push({activityPositions: polyline.decode(activity_polyline), activityName: activity_name, activityType: activity_type, activitySpeed: activity_speed, activityDate: activity_date, activityHeartRate: activity_heart_rate, activityColor: activity_color, activityDistance: activity_distance});
      }
      //console.log(polylines)
      setNodes(polylines);
    }

    fetchData();
  // eslint-disable-next-line
  }, []);

  return (
   
    <MapContainer center={[39.762516,-98.298467]} zoom={5} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />

      {nodes.map((activity, i) => (
        <Polyline key = {i} positions={activity.activityPositions} color={activity.activityColor}>
          <Popup>
            <div>
              <h2>{"Activity Name: " + activity.activityName}</h2>
              <hr />
              <h4>{"Date: " + activity.activityDate}</h4>
              <h4>{"Type: " + activity.activityType}</h4>
              <h4>{"Distance: " + activity.activityDistance + " Miles"}</h4>
              <h4>{"Average Heart Rate: " + activity.activityHeartRate}</h4>
              <h4>{"Average Speed: " + activity.activitySpeed}</h4>

            </div>
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}

export default App;
