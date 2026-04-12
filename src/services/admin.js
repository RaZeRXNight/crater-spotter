/// Creates an admin Profile if there are no accounts available
export async function CheckAndMakeDefaultAdminAccount(database) {
  try {
    const usersModel = database.model("Users");
    const users = await usersModel.findAll();
    const userCount = Object.keys(users).length;

    if (!userCount) {
      const newUser = await usersModel.create({
        authLevel: 2,
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

  if (!session.userid) {
    return false;
  }

  const user = await userModel.findByPk(session.userid);

  if (user.authLevel < 1) {
    return false;
  }

  return true;
}
