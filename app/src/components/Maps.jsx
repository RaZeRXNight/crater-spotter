import { APIProvider, Map } from "@vis.gl/react-google-maps";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const App = () => (
  <APIProvider apiKey={API_KEY}>
    <Map
      style={{ width: "100%", height: "200px" }}
      defaultCenter={{ lat: 22.54992, lng: 0 }}
      defaultZoom={3}
      gestureHandling="greedy"
      disableDefaultUI
    />
  </APIProvider>
);

export default App;
