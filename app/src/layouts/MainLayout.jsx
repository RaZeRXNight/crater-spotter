import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <>
      <header>
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/posts">Posts</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/auth">Login/Register</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
