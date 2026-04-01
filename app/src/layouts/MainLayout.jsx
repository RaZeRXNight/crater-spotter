import axios from "axios";
import { useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
  const Auth = useLoaderData();
  const Navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);

  function HandleVisibility(event) {
    const type = event.type;

    if (type == "mouseenter") {
      setIsVisible(true);
    } else if (type == "mouseleave") {
      setIsVisible(false);
    }
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
            <>
              <a
                onMouseLeave={HandleVisibility}
                onMouseEnter={HandleVisibility}
                href="/dashboard"
              >
                Dashboard
              </a>
            </>
          ) : (
            <a href="/auth">Login/Register</a>
          )}
        </nav>
      </header>
      <main>
        <ToastContainer />
        <Outlet context={Auth} />
      </main>
    </>
  );
}
