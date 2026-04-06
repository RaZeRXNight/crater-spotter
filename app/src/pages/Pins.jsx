import axios from "axios";
import { useCallback, useState } from "react";
import { useLoaderData, useNavigate, useOutletContext } from "react-router";
import { toast } from "react-toastify";
import Card from "../components/Card.jsx";
import App from "../components/Maps.jsx";
import { Pagination } from "../components/paginations.jsx";
import "../css/articles.css";
import "../css/forms.css";

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
    return undefined;
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
 * Fetches pins specific to the user that is logged in.
 * Returns the pin data as { pins: pins, count: count} or null on error
 */
export async function getUserPins({ page, perPage }) {
  const data = await axios
    .get("/api/pin/", {
      headers: {
        Authorization: "User",
        Accept: "application/json",
        perPage: perPage || 10,
        page: page || 1,
      },
    })
    .then(function (response) {
      return response.data.message;
    })
    .catch(function (error) {
      toast(error);
      return null;
    });
  return data;
}

/**
 * Fetches pins specified by a page number and an amount perPage.
 * input. Number page and Number perPage
 * return. { pins, count } or null on failure
 */
export async function getPins({ page, perPage }) {
  const data = await axios
    .get("/api/pin/", {
      headers: {
        Accept: "application/json",
        perPage: perPage || 10,
        page: page || 1,
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
      return null;
    });
  return data;
}

/**
 * Fetches the Pin Page Data and returns an object
 * returns { pins: { rows, count } } or null on a failure
 */
export async function fetchPinPageData({ params }) {
  const perPage = params.perPage || 3;
  const page = params.page || 1;

  const pinData = await getPins({ perPage: perPage, page: page });

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

  async function HandleSetCurrentLocation(event) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const coords = position.coords;
        setForm({
          ...form,
          coordinates: {
            lat: coords.latitude,
            lng: coords.longitude,
          },
        });
      },
      (error) => console.error(error),
    );
  }

  const HandleSubmit = async function (event) {
    event.preventDefault();
    const fileInput = document.querySelector("#file_upload");
    const file = fileInput.files[0];
    const formData = new FormData();

    formData.append("image", file);
    formData.append("title", form.title);
    formData.append("authorid", form.authorid);
    formData.append("comment", form.comment);
    formData.append("lat", form.coordinates.lat);
    formData.append("lng", form.coordinates.lng);

    axios.post("/api/pin", formData).then(function (request) {
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
          <div>
            <label for="map">Map</label>
            <App
              currentMarkerPosition={form.coordinates}
              OnClick={HandleMapClick}
            ></App>
            <div className="flex flex-row justify-end">
              <button onClick={HandleSetCurrentLocation} type="button">
                Use Current Location
              </button>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Optional</legend>
          <label for="image">Image</label>
          <input
            id="file_upload"
            type="file"
            name="image"
            accept="image/*"
            capture="environment"
          ></input>
          <label for="comment">Comment</label>
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
  const user = useOutletContext().user;
  const { id, image, title, comment, lat, lng } = data.pin;
  const coordinates = { lat, lng };

  async function HandleDeletePost(event) {
    event.currentTarget.disabled = true;
    DeletePost(event, data.pin, Navigator);
    event.currentTarget.disabled = false;
  }

  return (
    <>
      <section>
        <article>
          <h1>{title}</h1>
          {isAuthorized(data.pin, user) ? (
            <div className="flex flex-row justify-end gap-3">
              <button onClick={HandleDeletePost}>Delete</button>
              <button type="button">
                <a href={`/pin/edit/${id}`}>Edit</a>
              </button>
            </div>
          ) : undefined}
          <App
            currentMarkerPosition={coordinates}
            startingCenter={coordinates}
            defaultZoom={14}
          ></App>
          <p>{comment}</p>
          <img src={`/public/storage/${image}`} alt=""></img>
        </article>
      </section>
      {/* <section id="replies"> */}
      {/*   <h2>Replies</h2> */}
      {/*   <ul></ul> */}
      {/* </section> */}
    </>
  );
}

export function Pins({ perPage = 10 }) {
  const data = useLoaderData();
  const [pins, setPins] = useState(data.pins ? data.pins.rows : undefined);
  const [page, setPage] = useState(1);

  /**
   * Handles Page Change, calling the back-end api and retrieving the next page.
   * returns a count of the pins retrieved.
   */
  async function HandlePinPageChange(newPage, perPage) {
    const data = await getPins({ page: newPage, perPage: perPage });
    setPins(data.rows);
    return data.count;
  }

  return (
    <>
      <section className="flex flex-row justify-around">
        <h1 className="flex-3">Pins</h1>
        <button type="button">
          <a href="/pin/create">Create Pin</a>
        </button>
      </section>
      <section>
        <App markerPositions={pins} />
      </section>
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        HandlePageChange={HandlePinPageChange}
      />
      <div className="flex flex-col gap-3">{RenderPins({ rows: pins })}</div>
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        HandlePageChange={HandlePinPageChange}
      />
    </>
  );
}
