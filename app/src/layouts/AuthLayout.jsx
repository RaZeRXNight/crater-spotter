import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <>
      <h1>Dashboard</h1>

      <Outlet />
    </>
  );
}
