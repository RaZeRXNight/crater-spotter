import { ADMIN_AUTH_LEVEL, BASIC_AUTH_LEVEL } from "./constants.js";

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

export async function BasicAuth(sequelize, session) {
  const userModel = sequelize.models.Users;

  try {
    if (!session.userid) {
      return false;
    }

    const user = await userModel.findByPk(session.userid);

    if (user.authLevel < BASIC_AUTH_LEVEL) {
      return false;
    }
  } catch (error) {
    console.error(error);
  }

  return true;
}

export async function AdminAuth(sequelize, session) {
  const userModel = sequelize.models.Users;

  try {
    if (!session.userid) {
      return false;
    }

    const user = await userModel.findByPk(session.userid);

    if (user.authLevel < ADMIN_AUTH_LEVEL) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
  }
}
