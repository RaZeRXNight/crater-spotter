import axios from "axios";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Pagination } from "../components/paginations";
import "../css/Home.css";
import { getPins, getUserPins, RenderPins } from "./Pins";

/*
 * Gets the current user, authenticating their session if they're logged in.
 * Returns their user data { id, username }
 */
export async function getUser(userid = null) {
  const apiURL = userid ? `/api/user/${userid}` : "/api/auth";
  const apiHeader = { headers: { userid: userid } };

  const data = await axios
    .get(apiURL, userid ? apiHeader : {})
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      if (apiURL != "/api/auth") {
        console.error(error);
        toast.error(error.message);
      }
    });

  return data;
}

export async function HandleLogout(event) {
  event.currentTarget.disabled = true;
  const data = await axios
    .delete("/api/auth/logout")
    .then(function () {
      toast.success("Logged Out");
      return true;
    })
    .catch(function (error) {
      toast.error(response.message);
      return false;
    });
  return data;
}

export async function HandleUserDeletion(event) {
  const button = event.currentTarget;
  button.disabled = true;

  if (window.confirm(`Are you sure you want to delete this account?`)) {
    const data = await axios
      .delete(`/api/auth/delete`)
      .then(function () {
        toast.success("Deleted User");
        return true;
      })
      .catch(function (error) {
        toast.error(error.message);
        return false;
      });
    return data;
  }
}

export function Dashboard() {
  const data = useLoaderData();
  const Navigate = useNavigate();
  const { user, startingPins } = data;
  const [page, setPage] = useState(1);
  const [pins, setPins] = useState(startingPins ? startingPins.rows : []);
  const perPage = 3;

  /**
   * Handles Page Change, calling the back-end api and retrieving the next page.
   * returns a count of the pins retrieved.
   */
  async function HandlePinPageChange(newPage, perPage) {
    const data = await getUserPins({ page: newPage, perPage: perPage });
    setPins(data.rows);
    return data.count;
  }

  /**
   * Handles Logging out the user and then navigates to the home page.
   */
  async function HandleLogoutAndExit(event) {
    const data = await HandleLogout(event);
    if (data) {
      Navigate("/");
    }
  }

  /**
   * Handles User Deletion and navigates the user to the home page.
   */
  async function HandleUserDeletionAndExit(event) {
    const data = await HandleUserDeletion(event);
    if (data) {
      Navigate("/");
    }
  }

  return (
    <>
      <section id="posts">
        <h2>Recent Posts</h2>
        <div className="flex flex-col gap-3">
          <div>{<RenderPins rows={pins} user={user} />}</div>
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          HandlePageChange={HandlePinPageChange}
          perPage={perPage}
        />
      </section>
      <section>
        <button onClick={HandleLogoutAndExit} type="button">
          Logout
        </button>
        <button type="button">Lock Account</button>
        <button onClick={HandleUserDeletionAndExit} type="button">
          Delete Account
        </button>
      </section>
    </>
  );
}

export function UserProfile() {
  const userdata = useLoaderData();

  const { user, startingPins } = userdata;
  const [pins, setPins] = useState(startingPins.rows);
  const [page, setPage] = useState(1);
  const perPage = 3;

  async function HandlePinPageChange(newPage, perPage) {
    const data = await getPins({
      userid: user.id,
      page: newPage,
      perPage: perPage,
    });
    setPins(data.rows);
    return data.count;
  }

  return (
    <>
      <section>
        <h2>{user ? user.username : "Unknown"}'s Profile</h2>
      </section>
      <section id="posts" className={"flex flex-col gap-3"}>
        <h2>User Posts</h2>
        <Pagination
          page={page}
          setPage={setPage}
          HandlePageChange={HandlePinPageChange}
          perPage={perPage}
        />
        <div className="flex flex-col gap-3">
          {<RenderPins rows={pins} user={user} />}
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          HandlePageChange={HandlePinPageChange}
          perPage={perPage}
        />
      </section>
    </>
  );
}
