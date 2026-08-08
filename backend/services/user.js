export async function DeleteUser(usersModel, userId) {
  const commentModel = usersModel.sequelize.models.Comments;

  return usersModel.sequelize.transaction(async (transaction) => {
    await commentModel.destroy({
      where: { authorid: userId },
      transaction,
    });

    const deletedUsers = await usersModel.destroy({
      where: { id: userId },
      transaction,
    });

    if (!deletedUsers) {
      throw new Error("ERROR: USER DOES NOT EXIST");
    }

    return deletedUsers;
  });
}
