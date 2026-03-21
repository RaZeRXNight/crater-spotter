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
  const perPage = 10;
  const page = params.page;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [{ index: true, element: <Home /> }],
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
