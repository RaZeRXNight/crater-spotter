import axios from "axios";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Pagination } from "../components/paginations";
import "../css/Home.css";
import { getUserPins, RenderPins } from "./Pins";

/*
 * Gets the current user, authenticating their session if they're logged in.
 * Returns their user data { id, username }
 */
export async function getUser() {
  const data = await axios
    .get("/api/auth")
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      toast(error);
      return null;
    });
  return data;
}

export async function HandleLogout(event) {
  event.currentTarget.disabled = true;
  const data = await axios
    .delete("/api/auth/logout")
    .then(function () {
      toast("Logged Out");
      return true;
    })
    .catch(function () {
      toast(response);
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
        toast("Deleted User");
        return true;
      })
      .catch(function (error) {
        toast(error);
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
      <section>
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
