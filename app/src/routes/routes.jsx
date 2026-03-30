import { createBrowserRouter, createContext, RouterContextProvider, redirect, useNavigate } from "react-router";
import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../pages/Home";
import axios from "axios";
import { Pins, CreatePin, Pin, EditPin } from "../pages/pins.jsx";
import { userContext } from "../context.jsx";
import Auth from "../pages/Auth.jsx";

async function getUser() {
  const data = await axios.get("/api/auth").then(function (response) {
    console.log(response);
    return response.data;
  }).catch(function (response) {
    console.log("User Unauthenticated")
  })
  return data
}

async function fetchPinData({ params }) {
  const id = params.id;
  const pinData = await axios.get(`/api/pin/${id}`).then(function (response) {
    return response.data.message;
  });
  // const userData = fetchUserData();
  return { pin: pinData };
}

async function fetchPinPageData({ params }) {
  const perPage = params.perPage || 3;
  const page = params.page || 1;

  let pinData = await axios
    .get("/api/pin/", {
      headers: {
        Accept: "application/json",
        Authorization: "User",
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
    });
  return pinData;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [{ index: true, loader: fetchPinPageData, element: <Home /> }],
  },
  {
    path: "/auth",
    element: <MainLayout />,
    children: [{ index: true, element: <Auth /> }],
  },
  {
    path: "/pin",
    loader: async ({ context }) => {
      return { user: await getUser() }
    },
    element: <MainLayout />,
    children: [
      { index: true, element: <Pins perPage={10} />, loader: fetchPinPageData },
      { path: "/pin/create", element: <CreatePin /> },
      { path: "/pin/edit/:id", loader: fetchPinData, element: <EditPin /> },
      {
        path: "/pin/:id",
        loader: fetchPinData,
        element: <Pin />,
      },
    ],
  },
]
);

