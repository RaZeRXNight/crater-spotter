import App from "../components/Maps.jsx";
import { useLoaderData } from "react-router";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import Pagination from "../components/paginations.jsx";
import axios from "axios";
import "../css/forms.css";
import "../css/articles.css";

export function CreatePin() {
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
          console.log(request.data.message);
        } else {
          console.log(request.data.message);
          navigate(`/pin/${request.data.id}`);
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

export function Pin() {
  const data = useLoaderData();
  const { title, comment, lat, lng } = data;
  const coordinates = { lat, lng };

  return (
    <>
      <section>
        <article>
          <h1>{title}</h1>
          <App
            currentMarkerPosition={coordinates}
            startingCenter={coordinates}
            defaultZoom={14}
          ></App>
          <p>{comment}</p>
        </article>
      </section>
      <section id="replies">
        <h2>Replies</h2>
        <ul></ul>
      </section>
    </>
  );
}

export function Pins({ perPage = 10 }) {
  const [Pins, setPosts] = useState([]);

  return (
    <>
      <h1>Pins</h1>
      <a href="/pin/create">Create Pin</a>
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
