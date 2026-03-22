import { createBrowserRouter } from "react-router";
import AuthForm from "../components/AuthForm.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../pages/Home";
import axios from "axios";
import { Pins, CreatePin, Pin } from "../pages/pins.jsx";

async function fetchPinData({ params }) {
  const id = params.id;
  let pinData = await axios.get(`/api/pin/${id}`).then(function (response) {
    return response.data.message;
  });
  return pinData;
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
    element: <AuthLayout />,
    children: [
      { path: "/auth/login", element: <AuthForm /> },
      { path: "/auth/register", element: <AuthForm /> },
    ],
  },
  {
    path: "/pin",
    element: <MainLayout />,
    children: [
      { index: true, element: <Pins perPage={10} />, loader: fetchPinPageData },
      { path: "/pin/create", element: <CreatePin /> },
      {
        path: "/pin/:id",
        loader: fetchPinData,
        element: <Pin />,
      },
    ],
  },
]);
