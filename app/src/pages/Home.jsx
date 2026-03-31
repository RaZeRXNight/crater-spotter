import "../css/Home.css";
import App from "../components/Maps.jsx";
import Table from "../components/Table.jsx";
import { useLoaderData } from "react-router";
import Card from "../components/Card.jsx";

export default function Home() {
  const data = useLoaderData();
  const { pins, user } = data;
  const { rows, count } = pins;
  let rowsComponents;
  if (rows) {
    rowsComponents = rows.map((row) => {
      return <Card id={row.id} title={row.title} comment={row.comment} />;
    });
  }

  return (
    <>
      <section>
        <p>Welcome to the Home page!</p>
        <App></App>
      </section>
      <section id="posts">
        <h2>Recent Posts</h2>
        <div className="flex flex-col gap-3">{<>{rowsComponents}</>}</div>
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
