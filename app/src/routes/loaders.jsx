import axios from "axios";
import { getComments } from "../pages/Comments";
import { getPin, getPins, getUserPins } from "../pages/Pins";
import { getUser } from "../pages/Profile";

// Loaders
export async function getUserLoader() {
  return { user: await getUser() };
}

export async function PinDataLoader({ params }) {
  const id = params.id;

  const pinData = await axios
    .get(`/api/pin/${id}`)
    .then(function (response) {
      const data = response.data.message;
      return data;
    })
    .catch(function (error) {
      console.log(error);
    });
  const userData = await getUser();
  return { pin: pinData, user: userData };
}

export async function PinCommentDataLoader({ params }) {
  const id = params.id;

  const pinData = await getPin({ id });
  const commentData = await getComments({ id });
  const userData = await getUser();
  return { pin: pinData, user: userData, comments: commentData };
}

export async function UserPinsLoader() {
  const user = await getUser();
  const startingPins = await getUserPins({ page: 1, perPage: 3 });

  return {
    user,
    startingPins,
  };
}

export async function UserProfileLoader({ params }) {
  const userid = params.id;
  const user = await getUser(userid);
  const startingPins = await getPins({ userid, page: 1, perPage: 3 });

  return {
    user,
    startingPins,
  };
}
