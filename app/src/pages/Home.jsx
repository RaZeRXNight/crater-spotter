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
        <h2 className="text-center">Welcome!</h2>
        <App></App>
      </section>
      <section id="posts">
        <h2>Recent Posts</h2>
        <div className="flex flex-col gap-3">{<RenderPins rows={rows} />}</div>
      </section>
      <section id="about">
        <h2>About</h2>
        <p>
          This is a small javascript project created to aid in the safety of
          communities. There are many hazards on the road, and "potholes" are
          one of them. The project first started with this hazard in mind, but
          has plans to branch out to handle more location-based hazards. it uses
          react as its' front-end, with a sprinkling of tailwindcss. It uses
          expressjs as its back-end framework, and is well-equipped to be
          deployed on nearly any server.
        </p>
      </section>
      <section id="contact">
        <h2>Contact</h2>
        <p>
          If you have any inquiries or concerns, you'll be able to reach the
          developer on their <a href="https://github.com/RaZeRXNight">Github</a>{" "}
          or <a href="mailto:ricardomiller102003@gmail.com">Email</a>
        </p>
      </section>
    </>
  );
}
