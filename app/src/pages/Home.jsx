import { useLoaderData, useOutletContext } from "react-router";
import App from "../components/Maps.jsx";
import "../css/Home.css";
import { RenderPins } from "./Pins.jsx";

export default function Home() {
  const data = useLoaderData();
  const pins = data.pins;
  const rows = pins ? pins.rows : undefined;

  return (
    <>
      <section>
        <p>Welcome to the Home page!</p>
        <App></App>
      </section>
      <section id="posts">
        <h2>Recent Posts</h2>
        <div className="flex flex-col gap-3">{<RenderPins rows={rows} />}</div>
      </section>
      <section id="about">
        <h2>About</h2>
        <p></p>
      </section>
      <section id="contact">
        <h2>Contact</h2>
      </section>
    </>
  );
}
