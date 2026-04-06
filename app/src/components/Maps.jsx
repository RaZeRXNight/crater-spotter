import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useNavigate } from "react-router";
import { useLoaderData } from "react-router";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULTCENTER = { lat: 25.033328, lng: -77.421165 };

/**
 * Accepts an Onclick Function, An Array of markerPositions and a longitude & Latitude Object depicting positioning.
 * It returns a Map returned by Google's APIProvider
 */
const App = ({
  OnClick = function () {},
  style = { width: "100%", height: "300px" },
  markerPositions,
  currentMarkerPosition,
  startingCenter,
  defaultZoom = 11,
}) => {
  const data = useLoaderData();
  const Navigator = useNavigate();

  if (!markerPositions && data && data.pins && data.pins.rows) {
    markerPositions = data.pins.rows.map(function (row) {
      return { id: row.id, title: row.title, lat: row.lat, lng: row.lng };
    });
  }
  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={style}
        defaultCenter={startingCenter || DEFAULTCENTER}
        defaultZoom={defaultZoom}
        gestureHandling="greedy"
        disableDefaultUI
        onClick={OnClick}
        mapId={"DEMO_MAP_ID"}
      >
        {
          // Renders the List of MarkerPositions as Markers
          markerPositions
            ? markerPositions.map((marker) => {
                return (
                  <AdvancedMarker
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={function () {
                      Navigator(`/pin/${marker.id}`);
                    }}
                    title={marker.title}
                  />
                );
              })
            : undefined
        }

        {currentMarkerPosition ? (
          <AdvancedMarker position={currentMarkerPosition} />
        ) : undefined}
      </Map>
    </APIProvider>
  );
};

export default App;
