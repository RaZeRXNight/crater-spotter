import {
  createBrowserRouter,
  createContext,
  RouterContextProvider,
  redirect,
  useNavigate,
} from "react-router";
import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../pages/Home";
import axios from "axios";
import { Pins, CreatePin, Pin, EditPin } from "../pages/pins.jsx";
import { getUser } from "../pages/Profile.jsx";
import { fetchPinPageData } from "../pages/pins.jsx";
import Auth from "../pages/Auth.jsx";
import Dashboard from "../pages/Dashboard.jsx";

// Fetch

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

// Routes
export const router = createBrowserRouter([
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
    path: "/pin",
    loader: async ({ context }) => {
      return { user: await getUser() };
    },
    element: <MainLayout />,
    children: [
      { index: true, element: <Pins perPage={10} />, loader: fetchPinPageData },
      { path: "/pin/create", element: <CreatePin /> },
      { path: "/pin/edit/:id", loader: PinDataLoader, element: <EditPin /> },
      {
        path: "/pin/:id",
        loader: PinDataLoader,
        element: <Pin />,
      },
    ],
  },
  {
    path: "/dashboard",
    loader: getUserLoader,
    element: <MainLayout />,
    children: [{ index: true, loader: getUserLoader, element: <Dashboard /> }],
  },
]);
