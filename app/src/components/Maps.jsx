import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const App = () => {
  const markerPositions = [{ lat: 22.54992, lng: 0 }];

  axios
    .get("/api/user")
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.error(err);
    });

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={{ width: "100%", height: "200px" }}
        defaultCenter={{ lat: 25.033328, lng: -77.421165 }}
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI
      >
        {markerPositions.map((marker) => {
          return <Marker position={marker} />;
        })}
      </Map>
    </APIProvider>
  );
};

export default App;
