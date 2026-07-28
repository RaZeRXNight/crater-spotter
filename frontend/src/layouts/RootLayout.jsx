import { Outlet, useLoaderData } from "react-router";
import { ToastContainer } from "react-toastify";

export default function RootLayout() {
  const config = useLoaderData();

  return (
    <>
      <Outlet context={config} />
      <ToastContainer
        position={"bottom-center"}
        closeOnClick={true}
        pauseOnFocusLoss={false}
        theme="dark"
      />
    </>
  );
}
