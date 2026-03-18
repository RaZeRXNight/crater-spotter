import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import axios from "axios";
import { useCallback, useState } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Accepts an Onclick Function, An Array of markerPositions and a longitude & Latitude Object depicting positioning.
 * It returns a Map returned by Google's APIProvider
 */
const App = ({ OnClick, markerPositions, currentMarkerPosition }) => {
  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={{ width: "100%", height: "200px" }}
        defaultCenter={{ lat: 25.033328, lng: -77.421165 }}
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI
        onClick={OnClick}
      >
        {
          // Renders the List of MarkerPositions as Markers
          function () {
            if (markerPositions) {
              return markerPositions.map((marker) => {
                return <Marker position={marker} />;
              });
            }
          }
        }

        {function () {
          if (currentMarkerPosition) {
            return <Marker position={currentMarkerPosition} />;
          }
        }}
      </Map>
    </APIProvider>
  );
};

export default App;
