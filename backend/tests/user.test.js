import assert from "node:assert/strict";
import { Sequelize, DataTypes } from "sequelize";
import { DeleteUser } from "../services/user.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});
const Users = sequelize.define("Users", { username: DataTypes.STRING });
const Comments = sequelize.define("Comments", {
  authorid: DataTypes.INTEGER,
  PinParent: DataTypes.INTEGER,
});

try {
  await sequelize.sync();

  const user = await Users.create({ username: "delete-me" });
  await Comments.create({ authorid: user.id, PinParent: 99 });
  await Comments.create({ authorid: 999, PinParent: user.id });

  await DeleteUser(Users, user.id);

  assert.equal(await Users.count({ where: { id: user.id } }), 0);
  assert.equal(await Comments.count({ where: { authorid: user.id } }), 0);
  assert.equal(await Comments.count({ where: { PinParent: user.id } }), 1);

  const rollbackUser = await Users.create({ username: "rollback-me" });
  await Comments.create({ authorid: rollbackUser.id, PinParent: 100 });
  const destroy = Users.destroy;
  Users.destroy = async () => {
    throw new Error("forced failure");
  };

  try {
    await assert.rejects(
      () => DeleteUser(Users, rollbackUser.id),
      /forced failure/,
    );
  } finally {
    Users.destroy = destroy;
  }

  assert.equal(await Users.count({ where: { id: rollbackUser.id } }), 1);
  assert.equal(await Comments.count({ where: { authorid: rollbackUser.id } }), 1);
} finally {
  await sequelize.close();
}
