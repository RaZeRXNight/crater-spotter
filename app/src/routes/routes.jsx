import { createBrowserRouter } from "react-router";
import { Home } from "../pages/Home";
// import { AuthForm } from "../components/AuthForm.jsx";
// import { AuthLayout } from "../layouts/auth_layout.jsx";
// Home()
export const router = createBrowserRouter([
  {
    path: "/",
    element: Home(),
    children: [],
  },
  {
    path: "/auth",
    element: Home(),
    // children: [{ index: true, Component: AuthForm }],
  },
]);
