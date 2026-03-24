import App from "../components/Maps.jsx";
import { useLoaderData } from "react-router";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import Pagination from "../components/paginations.jsx";
import Card from "../components/Card.jsx";
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
    event.preventDefault();
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
      <form method="POST" onSubmit={HandleSubmit}>
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
            value={form.comment}
            onChange={function (event) {
              setForm({ ...form, comment: event.target.value });
            }}
          ></textarea>
        </fieldset>
        <button id="submit-btn" type="submit">
          Submit
        </button>
      </form>
    </>
  );
}

export function EditPin() {
  const data = useLoaderData();
  const pinData = data.pin;
  const { id, title, comment, lat, lng } = pinData;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: title,
    comment: comment,
    coordinates: {
      lat: lat,
      lng: lng,
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
    event.preventDefault();
    axios
      .put(`/api/pin/${id}`, form, {
        headers: { "Content-Type": "application/json" },
      })
      .then(function (request) {
        if (request.data.error) {
          console.log(request.data.message);
        } else {
          console.log(request.data.message);
          navigate(`/pin/${id}`);
        }
      });
  };

  return (
    <>
      <form method="POST" onSubmit={HandleSubmit}>
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
            value={form.comment}
            onChange={function (event) {
              setForm({ ...form, comment: event.target.value });
            }}
          ></textarea>
        </fieldset>
        <button id="submit-btn" type="submit">
          Submit
        </button>
      </form>
    </>
  );
}

export function Pin() {
  const Navigator = useNavigate();
  const data = useLoaderData();
  const { id, title, comment, lat, lng } = data.pin;
  const coordinates = { lat, lng };

  const DeletePost = async function (event) {
    const button = event.currentTarget;
    button.disabled = true;
    if (window.confirm(`Are you sure you want to delete ${title} post?`)) {
      axios.delete(`/api/pin/${id}`).then(function (response) {
        console.log(response);
        if (!response.data.error) {
          Navigator("/pin/");
        }
      });
    }
  };

  return (
    <>
      <section>
        <article>
          <h1>{title}</h1>
          <div>
            <button onClick={DeletePost}>Delete</button>
            <a href={`/pin/edit/${id}`}>Edit</a>
          </div>
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
  const data = useLoaderData();
  const { rows, count } = data;
  let rowsComponents;
  if (rows) {
    rowsComponents = rows.map((row) => {
      return <Card id={row.id} title={row.title} comment={row.comment} />;
    });
  }

  return (
    <>
      <h1>Pins</h1>
      <a href="/pin/create">Create Pin</a>
      <table id="posts">
        <thead>
          <tr></tr>
        </thead>
        <tbody>
          <div className="flex flex-col gap-3">{<>{rowsComponents}</>}</div>
        </tbody>
        <tfoot>
          <Pagination />
        </tfoot>
      </table>
    </>
  );
}
