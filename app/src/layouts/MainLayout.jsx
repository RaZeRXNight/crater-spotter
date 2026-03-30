import { Outlet, useLoaderData } from "react-router";

export default function MainLayout() {
  const Auth = useLoaderData();
  console.log(Auth)
  return (
    <>
      <header>
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/pin">Posts</a>
          <a href="/#about">About</a>
          <a href="/#contact">Contact</a>
          <a href="/auth">Login/Register</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
