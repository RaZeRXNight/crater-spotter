import axios from "axios";

export async function getUser() {
  const data = await axios
    .get("/api/auth")
    .then(function (response) {
      return response.data;
    })
    .catch(function (response) {
      return null;
    });
  return data;
}

export async function getUserPins(page, perPage, user) {
  const data = await axios
    .get("/api/pin/", {
      headers: {
        Authorization: user.userid,
        perPage,
        page,
      },
    })
    .then(function (response) {
      console.log(response);
      return response;
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
  return data;
}

export async function HandleLogout(event) {
  const data = await axios
    .delete("/api/auth/logout")
    .then(function (response) {
      Navigate("/");
    })
    .catch(function (response) {
      console.log(response);
    });
  return data;
}
