import App from "../components/Maps.jsx";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import Pagination from "../components/paginations.jsx";
import axios from "axios";
import "../css/forms.css";

export function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    comment: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
  });

  const HandleMapClick = useCallback(
    (event) => {
      if (event.type === "click") {
        const coordinates = event.detail.latLng;
        setForm({ ...form, coordinates: coordinates });
      }
    },
    [form],
  );

  const HandleSubmit = async function (event) {
    axios
      .post("/api/pin", form, {
        headers: { "Content-Type": "application/json" },
      })
      .then(function (request) {
        if (request.data.error) {
          console.log(request.data.error);
        } else if (request.data.success) {
          navigate(`/pins/${request.data.id}`);
        }
      });
  };

  return (
    <>
      <form method="POST" action={HandleSubmit}>
        <fieldset>
          <legend>Required</legend>
          <div>
            <label for="map">Map</label>
            <App
              currentMarkerPosition={form.coordinates}
              OnClick={HandleMapClick}
            ></App>
          </div>
          <div>
            <label for="Title">Title</label>
            <input
              required
              type="text"
              name="Title"
              value={form.title}
              onChange={(event) => {
                setForm({ ...form, title: event.target.value });
              }}
              placeholder="Title"
            ></input>
          </div>
        </fieldset>
        <fieldset>
          <legend>Description</legend>
          <textarea
            name="comment"
            rows="10"
            cols="30"
            placeholder="Here is the Text"
            value={form.detail}
            onChange={function (event) {
              setForm({ ...form, comment: event.target.value });
            }}
          ></textarea>
        </fieldset>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export function Posts(perPage = 10) {
  const [Posts, setPosts] = useState({});

  return (
    <>
      <h1>Posts</h1>
      <a href="/posts/create">Create Post</a>
      <table id="posts">
        <thead>
          <tr></tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <Pagination />
        </tfoot>
      </table>
    </>
  );
}
