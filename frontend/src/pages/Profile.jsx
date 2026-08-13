import api from "../api.js";
import { useState } from "react";
import { useLoaderData, useNavigate, useOutletContext } from "react-router";
import { Pagination } from "../components/paginations";
import "../css/Home.css";
import { getPins, getUserPins, RenderPins } from "./Pins";

let inFlightAuthRequest = null;

/**
 * Checks if the primary user is authorized to perform actions on the other user.
 */
export function isAuthorized(primaryUser, otherUser) {
  if (primaryUser.id && otherUser.id) {
    return primaryUser.id == otherUser.id || otherUser.authLevel > 1;
  }
}

/**
 * Gets the current user, authenticating their session if they're logged in.
 * Returns their user data { id, username }
 */
export function getUser(userid = null) {
  if (userid) {
    return api({ url: `/api/v1/user/${userid}` }).then(({ data }) => data);
  }

  if (!inFlightAuthRequest) {
    inFlightAuthRequest = api({
      url: "/api/v1/auth",
      silent: true,
    })
      .then(({ data }) => data)
      .finally(() => {
        inFlightAuthRequest = null;
      });
  }

  return inFlightAuthRequest;
}

export async function HandleLogout() {
  const { err } = await api({ url: "/api/v1/auth/logout", method: "DELETE" });
  if (err) return false;
  return true;
}

export async function HandleUserDeletion() {
  if (window.confirm(`Are you sure you want to delete this account?`)) {
    const { err } = await api({ url: "/api/v1/auth/delete", method: "DELETE" });
    if (err) return;
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
      <section id="posts" className={"flex flex-col gap-3"}>
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
      <section className="flex flex-row justify-around ">
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
  const user = useOutletContext();
  const navigate = useNavigate();

  const { user: userProfile, startingPins } = userdata;
  const [pins, setPins] = useState(startingPins.rows);
  const [page, setPage] = useState(1);
  const [profile, setProfile] = useState(userProfile);
  const perPage = 3;

  async function HandlePinPageChange(newPage, perPage) {
    const data = await getPins({
      userid: userProfile.id,
      page: newPage,
      perPage: perPage,
    });
    setPins(data.rows);
    return data.count;
  }

  async function HandleProfileSuspension() {
    const { err, data } = await api({
      url: `/api/v1/user/${profile.id}`,
      method: "PUT",
      headers: { action: "suspend" },
      body: { username: profile.username, authLevel: profile.authLevel },
    });
    if (err) return;
    setProfile({ ...profile, authLevel: data.authLevel });
  }

  async function HandleProfileDeletion() {
    if (
      window.confirm(
        `Are you sure you want to delete #${profile.id} ${profile.username}'s account?`,
      )
    ) {
      const { err } = await api({ url: `/api/v1/user/${profile.id}`, method: "DELETE" });
      if (err) return;
      setTimeout(() => navigate("/"), 2000);
    }
  }

  return (
    <>
      <section>
        <h2>{profile ? profile.username : "Unknown"}'s Profile</h2>
        {user.user && isAuthorized(profile, user.user)
          ? (function () {
              return (
                <>
                  <button
                    onClick={HandleProfileSuspension}
                    color="red"
                    type="button"
                  >
                    {!profile.authLevel ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    onClick={HandleProfileDeletion}
                    color="red"
                    type="button"
                  >
                    Delete
                  </button>
                </>
              );
            })()
          : undefined}
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
          {<RenderPins rows={pins} user={profile} />}
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
