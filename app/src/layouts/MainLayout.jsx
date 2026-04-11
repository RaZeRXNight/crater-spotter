import { Outlet, useLoaderData } from "react-router";
import { ToastContainer } from "react-toastify";
import "../css/Home.css";

export default function MainLayout() {
  const Auth = useLoaderData();
  const user = Auth.user;

  return (
    <>
      <header>
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/pin">Posts</a>
          <a href="/#about">About</a>
          <a href="/#contact">Contact</a>
          {user && user.id ? (
            <>
              <a href="/dashboard">{user.username}</a>
            </>
          ) : (
            <a href="/auth">Login/Register</a>
          )}
        </nav>
      </header>
      <ToastContainer
        position={"bottom-center"}
        closeOnClick={true}
        pauseOnFocusLoss={false}
        theme="dark"
      />
      <main>
        <Outlet context={Auth} />
      </main>
    </>
  );
}
