import { useState } from "react";
import "../css/Home.css";
import { useLoaderData } from "react-router";
import { getUser, getUserPins, HandleLogout } from "./Profile";

export default function Dashboard() {
  const data = useLoaderData();
  const { user } = data;
  const [page, setPage] = useState(1);
  const [pins, setPins] = useState([]);
  const perPage = 10;

  // setPins(getUserPins(page, perPage));

  return (
    <>
      <h2>Welcome {user.username}</h2>
      <section>
        <h3>Recent Posts</h3>
      </section>
      <section>
        <button onClick={HandleLogout} type="button">
          Logout
        </button>
        <button type="button">Lock Account</button>
        <button type="button">Delete Account</button>
      </section>
    </>
  );
}
