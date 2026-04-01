import { createBrowserRouter, RouterContextProvider } from "react-router";
import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../pages/Home";
import axios from "axios";
import { Pins, CreatePin, Pin, EditPin } from "../pages/pins.jsx";
import { getUser, Dashboard, getUserPins } from "../pages/Profile.jsx";
import { fetchPinPageData } from "../pages/pins.jsx";
import Auth from "../pages/Auth.jsx";
import { authMiddleware } from "../middleware/authMiddleware.jsx";

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
    startingPins: await getUserPins({ page: 2, perPage: 3 }),
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
      { index: true, element: <Pins perPage={10} />, loader: fetchPinPageData },
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
