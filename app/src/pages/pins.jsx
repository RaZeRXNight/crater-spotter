import App from "../components/Maps.jsx";
import { useLoaderData, useNavigate, useOutletContext } from "react-router";
import { useCallback, useState } from "react";
import { getUser } from "./Profile.jsx";
import { Pagination } from "../components/paginations.jsx";
import Card from "../components/Card.jsx";
import axios from "axios";
import "../css/forms.css";
import "../css/articles.css";
import { toast } from "react-toastify";

export function isAuthorized(pin, user) {
  if (pin && pin.authorid && user && user.id) {
    return pin.authorid == user.id;
  }
  return false;
}

/**
 * Takes a List of Pinks as input, and returns them mapped into
 * Card Elements.
 *
 * **Input**. Row: []
 * **Return**. List of Elements
 */
export function RenderPins({ rows, user }) {
  if (!rows) {
    return null;
  }
  return rows.map((row) => {
    return (
      <Card
        key={row.id}
        id={row.id}
        title={row.title}
        comment={row.comment}
        admin={user ? isAuthorized(user, row) : false}
      />
    );
  });
}

/**
 * Fetches the Pin Page Data and returns an object
 * returns { pins: { rows, count } } or null on a failure
 */
export async function fetchPinPageData({ params, context }) {
  const perPage = params.perPage || 3;
  const page = params.page || 1;

  let pinData = await axios
    .get("/api/pin/", {
      headers: {
        Accept: "application/json",
        perPage: perPage,
        page: page,
      },
    })
    .then(function (response) {
      const responseObject = {
        rows: response.data.rows,
        count: response.data.count,
      };
      return responseObject;
    })
    .catch(function (error) {
      toast(error);
      return undefined;
    });
  return { pins: pinData };
}

export function CreatePin() {
  const context = useOutletContext();
  const navigate = useNavigate();
  const user = context.user;
  const [form, setForm] = useState({
    authorid: user.id,
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
          toast(request.data.message);
        } else {
          toast(request.data.message);
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

export const DeletePost = async function (event, pin, Navigator) {
  const button = event.currentTarget;
  button.disabled = true;
  if (window.confirm(`Are you sure you want to delete ${pin.title} post?`)) {
    axios.delete(`/api/pin/${pin.id}`).then(function (response) {
      toast(response);
      if (!response.data.error) {
        Navigator("/pin/");
      }
    });
  }
};

export function EditPin() {
  const context = useOutletContext();
  const data = useLoaderData();
  const navigate = useNavigate();
  const user = context.user;
  const pinData = data.pin;
  const { id, title, comment, lat, lng } = pinData;

  const [form, setForm] = useState({
    title: title,
    authorid: user.id,
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
          toast(request.data.message);
        } else {
          toast(request.data.message);
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
  const user = useOutletContext();
  const { id, authorid, title, comment, lat, lng } = data.pin;
  const coordinates = { lat, lng };

  async function HandleDeletePost(event) {
    event.currentTarget.disabled = true;
    DeletePost(event, data.pin, Navigator);
  }

  return (
    <>
      <section>
        <article>
          <h1>{title}</h1>
          {isAuthorized(data.pin, user) ? (
            <div>
              <button onClick={HandleDeletePost}>Delete</button>
              <a href={`/pin/edit/${id}`}>Edit</a>
            </div>
          ) : undefined}
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
  const { pins, user } = data;
  const { rows, count } = pins;
  const { page, setPage } = useState(1);
  let rowsComponents;
  if (rows) {
    rowsComponents = rows.map((row) => {
      return (
        <Card
          id={row.id}
          title={row.title}
          comment={row.comment}
          authorid={row.authorid}
          interactive={true}
          admin={isAuthorized(row, user)}
        />
      );
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
