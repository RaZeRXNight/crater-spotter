import App from "../components/Maps.jsx";
import { useCallback, useState } from "react";

export function CreatePost() {
  const [form, setform] = useState({});
  const [markerPositions, setMarkerPositions] = useState([
    { lat: 22.54992, lng: 0 },
  ]);
  const [currentMarkerPosition, setCurrentMarkerPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const HandleMapClick = useCallback((event) => {
    if (event.type === "click") {
      const coordinates = event.detail.latLng;
      setCurrentMarkerPosition(coordinates);
    }
  });

  return (
    <>
      <form>
        <label for="map"></label>
        <App
          currentMarkerPosition={currentMarkerPosition}
          markerPositions={markerPositions}
          OnClick={HandleMapClick}
        ></App>
      </form>
    </>
  );
}

export function Posts(perPage = 10) {
  const [Posts, setPosts] = useState({});

  return (
    <>
      <h1>Posts</h1>
      <table id="posts">
        <thead>
          <tr></tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr></tr>
        </tfoot>
      </table>
    </>
  );
}
