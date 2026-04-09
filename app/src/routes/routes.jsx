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
import { Dashboard, getUser, UserProfile } from "../pages/Profile.jsx";

// Loaders
async function getUserLoader({ context }) {
  return { user: await getUser() };
}

async function PinDataLoader({ params }) {
  const id = params.id;
  console.log("hello world");
  const pinData = await axios
    .get(`/api/pin/${id}`)
    .then(function (response) {
      const data = response.data.message;
      console.log(data);
      return data;
    })
    .catch(function (error) {
      console.log(error);
    });
  const userData = await getUser();
  return { pin: pinData, user: userData };
}

async function UserPinsLoader() {
  return {
    user: await getUser(),
    startingPins: await getUserPins({ page: 1, perPage: 3 }),
  };
}

async function UserProfileLoader({ params }) {
  const userid = params.id;
  return {
    user: await getUser(),
    startingPins: await getPins({ userid, page: 1, perPage: 10 }),
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
  {
    path: "/profile/:id",
    loader: UserProfileLoader,
    element: <MainLayout />,
    children: [{ index: true, element: <UserProfile /> }],
  },
];

// Routes
export const router = createBrowserRouter(routes);
