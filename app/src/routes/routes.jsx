import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import AuthForm from "../components/AuthForm.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import Posts from "../pages/posts.jsx";
// Home()
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [],
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
    path: "/posts",
    element: <MainLayout />,
    children: [{ index: true, element: <Posts /> }],
  },
]);
