import { ADMIN_AUTH_LEVEL } from "./constants.js";

/// Creates an admin Profile if there are no accounts available
export async function CheckAndMakeDefaultAdminAccount(database) {
  try {
    const usersModel = database.model("Users");
    const users = await usersModel.findAll();
    const userCount = Object.keys(users).length;

    if (!userCount) {
      const newUser = await usersModel.create({
        authLevel: ADMIN_AUTH_LEVEL,
        username: "admin",
        email: "default@gmail.com",
        password: "password",
      });
      newUser.save();
      console.log(`${newUser.username} Created!`);
    }
  } catch (error) {
    console.error(error);
  }
}

