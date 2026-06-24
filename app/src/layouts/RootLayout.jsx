import { Outlet, useLoaderData } from "react-router";

export default function RootLayout() {
  const config = useLoaderData();

  return (
    <>
      <Outlet context={config} />
    </>
  );
}
