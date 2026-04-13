import axios from "axios";
import {
  createBrowserRouter,
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "react-router";
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
  getPin,
} from "../pages/Pins.jsx";
import { Dashboard, getUser, UserProfile } from "../pages/Profile.jsx";
import { getComments } from "../pages/Comments.jsx";

// Loaders
async function getUserLoader({ context }) {
  return { user: await getUser() };
}

async function PinDataLoader({ params }) {
  const id = params.id;

  const pinData = await axios
    .get(`/api/pin/${id}`)
    .then(function (response) {
      const data = response.data.message;
      return data;
    })
    .catch(function (error) {
      console.log(error);
    });
  const userData = await getUser();
  return { pin: pinData, user: userData };
}

async function PinCommentDataLoader({ params }) {
  const id = params.id;

  const pinData = await getPin({ id });
  const commentData = await getComments({ id });
  const userData = await getUser();
  return { pin: pinData, user: userData, comments: commentData };
}

async function UserPinsLoader() {
  const user = await getUser();
  const startingPins = await getUserPins({ page: 1, perPage: 3 });

  return {
    user,
    startingPins,
  };
}

async function UserProfileLoader({ params }) {
  const userid = params.id;
  const user = await getUser(userid);
  const startingPins = await getPins({ userid, page: 1, perPage: 3 });

  return {
    user,
    startingPins,
  };
}

function RootErrorBoundary() {
  const navigate = useNavigate();
  let error = useRouteError();
  let data = useLoaderData();
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        {data ? (
          <>
            {Object.keys(data).map(function (item) {
              return <p>{item} not found</p>;
            })}
          </>
        ) : undefined}
      </>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        {data ? (
          <>
            {Object.keys(data).map(function (item) {
              if (!data[item]) {
                return <p>{item.toUpperCase()} Was not Found</p>;
              }
            })}
          </>
        ) : undefined}
        <button
          onClick={function (params) {
            navigate(-1);
          }}
          type="button"
        >
          Go Back
        </button>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

const authRoutes = {
  path: "/auth",
  loader: getUserLoader,
  element: <MainLayout />,
  children: [{ index: true, element: <Auth /> }],
};

const pinRoutes = {
  path: "/pin",
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
      ErrorBoundary: RootErrorBoundary,
      loader: PinCommentDataLoader,
      element: <Pin />,
    },
  ],
};

const dashboardRoutes = {
  path: "/dashboard",
  middleware: [authMiddleware],
  children: [
    {
      index: true,
      loader: UserPinsLoader,
      element: <Dashboard />,
    },
  ],
};

const profileRoutes = {
  path: "/profile",
  children: [
    {
      path: "/profile/:id",
      ErrorBoundary: RootErrorBoundary,
      loader: UserProfileLoader,
      element: <UserProfile />,
    },
  ],
};

const routes = [
  {
    path: "/",
    ErrorBoundary: RootErrorBoundary,
    loader: getUserLoader,
    element: <MainLayout />,
    children: [
      { index: true, loader: fetchPinPageData, element: <Home /> },
      dashboardRoutes,
      pinRoutes,
      profileRoutes,
    ],
  },
  authRoutes,
];

// Routes
export const router = createBrowserRouter(routes);
