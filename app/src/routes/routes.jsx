import axios from "axios";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout.jsx";
import { authMiddleware } from "../middleware/authMiddleware.jsx";
import Auth from "../pages/Auth.jsx";
import Home from "../pages/Home";
import {
  CreatePin,
  EditPin,
  fetchPinPageData,
  Pin,
  Pins,
  getUserPins,
  getPins,
} from "../pages/Pins.jsx";
import { Dashboard, getUser } from "../pages/Profile.jsx";

// Loaders
async function getUserLoader({ context }) {
  return { user: await getUser() };
}

async function PinDataLoader({ params }) {
  const id = params.id;
  const pinData = await axios.get(`/api/pin/${id}`).then(function (response) {
    return response.data.message;
  });
  const userData = await getUser();
  return { pin: pinData, user: userData };
}

async function UserPinsLoader({ context }) {
  return {
    user: await getUser(),
    startingPins: await getUserPins({ page: 1, perPage: 3 }),
  };
}

const routes = [
  {
    path: "/",
    loader: getUserLoader,
    element: <MainLayout />,
    children: [{ index: true, loader: fetchPinPageData, element: <Home /> }],
  },
  {
    path: "/auth",
    loader: getUserLoader,
    element: <MainLayout />,
    children: [{ index: true, element: <Auth /> }],
  },
  {
    path: "/dashboard",
    loader: getUserLoader,
    middleware: [authMiddleware],
    element: <MainLayout />,
    children: [
      {
        index: true,
        loader: UserPinsLoader,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/pin",
    loader: getUserLoader,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Pins perPage={10} />,
        loader: async () => {
          return { pins: await getPins({ perPage: 10, page: 1 }) };
        },
      },
      {
        path: "/pin/create",
        middleware: [authMiddleware],
        element: <CreatePin />,
      },
      {
        path: "/pin/edit/:id",
        middleware: [authMiddleware],
        loader: PinDataLoader,
        element: <EditPin />,
      },
      {
        path: "/pin/:id",
        loader: PinDataLoader,
        element: <Pin />,
      },
    ],
  },
];

// Routes
export const router = createBrowserRouter(routes);
