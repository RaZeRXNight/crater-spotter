import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Outlet />
    </div>
  );
}

modules.export = AuthLayout;
