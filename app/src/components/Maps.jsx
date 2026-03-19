import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
// import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULTCENTER = { lat: 25.033328, lng: -77.421165 };

/**
 * Accepts an Onclick Function, An Array of markerPositions and a longitude & Latitude Object depicting positioning.
 * It returns a Map returned by Google's APIProvider
 */
const App = ({
  OnClick,
  markerPositions,
  currentMarkerPosition,
  defaultZoom,
}) => {
  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={{ width: "100%", height: "300px" }}
        defaultCenter={DEFAULTCENTER}
        defaultZoom={defaultZoom || 11}
        gestureHandling="greedy"
        disableDefaultUI
        onClick={OnClick}
      >
        {
          // Renders the List of MarkerPositions as Markers
          markerPositions
            ? markerPositions.map((marker) => {
                return <Marker key={marker} position={marker} />;
              })
            : undefined
        }

        {currentMarkerPosition ? (
          <Marker position={currentMarkerPosition} />
        ) : undefined}
      </Map>
    </APIProvider>
  );
};

export default App;
