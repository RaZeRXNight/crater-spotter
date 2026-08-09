import { DataTypes } from "sequelize";

export default function Comments(sequelize) {
  const userModel = sequelize.models.Users;
  const pinModel = sequelize.models.Pins;
  const commentModel = sequelize.define(
    "Comments",
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      replyLevel: { allowNull: false, type: DataTypes.INTEGER },
      authorid: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: userModel,
          key: "id",
        },
      },
      comment: { type: DataTypes.STRING },
      PinParent: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: pinModel, key: "id" },
      },
      CommentParent: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      createdAt: true,
      updatedAt: "updateTimestamp",
    },
  );
  commentModel.belongsTo(sequelize.models.Users, {
    foreignKey: "authorid",
    as: "author",
  });
  return sequelize.models.Comments;
}
