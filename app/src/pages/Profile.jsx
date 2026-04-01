import axios from "axios";
import { useState, useEffect } from "react";
import { useLoaderData, redirect, useNavigate } from "react-router";
import { toast } from "react-toastify";
import "../css/Home.css";
import { RenderPins } from "./pins";
import { Pagination } from "../components/paginations";

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

export async function getUserPins({ page, perPage }) {
  const data = await axios
    .get("/api/pin/", {
      headers: {
        Authorization: "User",
        Accept: "application/json",
        perPage: perPage || 10,
        page: page || 1,
      },
    })
    .then(function (response) {
      return response.data.message;
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
    .then(function (response) {
      toast("Logged Out");
      return true;
    })
    .catch(function (error) {
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
      .then(function (response) {
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
  const [pins, setPins] = useState(startingPins.rows || []);
  const perPage = 3;

  /**
   * Handles Page Changle, calling the back-end api and retrieving the next page.
   * returns a count of the pins retrieved.
   */
  async function HandlePageChange(newPage, perPage) {
    const data = await getUserPins({ page: newPage, perPage: perPage });
    setPins(data.rows);
    return data.count;
  }

  /**
   * Handles page decrementing and calls HandlePageChange
   */
  async function HandlePrev(event) {
    const newPage = page - 1;

    if (!newPage) {
      return null;
    }

    setPage(newPage);
    const newCount = await HandlePageChange(newPage, perPage);

    if (newPage > 1) {
      event.currentTarget.disabled = false;
    }
  }

  /**
   * Handles page incrementing and calls HandlePageChange
   */
  async function HandleNext(event) {
    const newPage = page + 1;

    if (!newPage) {
      event.currentTarget.disabled = true;
      return null;
    }

    setPage(newPage);
    const newCount = await HandlePageChange(newPage, perPage);

    if (newCount == perPage) {
      event.currentTarget.disabled = false;
    }
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
        <h3>Recent Posts</h3>
        <div className="flex flex-col gap-3">
          <div>{<RenderPins rows={pins} user={user} />}</div>
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          HandlePageChange={HandlePageChange}
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
