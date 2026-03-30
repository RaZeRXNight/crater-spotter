import axios from "axios";
import { Outlet, useLoaderData, useNavigate } from "react-router";

export default function MainLayout() {
  const Auth = useLoaderData();
  const Navigate = useNavigate();

  function HandleLogout(event) {
    axios
      .delete("/api/auth/logout")
      .then(function (response) {
        Navigate("/");
      })
      .catch(function (response) {
        console.log(response);
      });
  }

  return (
    <>
      <header>
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/pin">Posts</a>
          <a href="/#about">About</a>
          <a href="/#contact">Contact</a>
          {Auth.user ? (
            <a onClick={HandleLogout}>Logout</a>
          ) : (
            <a href="/auth">Login/Register</a>
          )}
        </nav>
      </header>
      <main>
        <Outlet context={Auth} />
      </main>
    </>
  );
}
