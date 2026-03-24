import { DataTypes } from "sequelize";

export default function Comments(sequelize) {
  sequelize.define(
    "Comments",
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      image: { allowNull: true, type: DataTypes.STRING },
      authorid: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: userModel,
          key: "id",
        },
      },
      title: { allowNull: false, type: DataTypes.STRING },
      comment: { type: DataTypes.STRING },
      lat: { allowNull: false, type: DataTypes.DOUBLE },
      lng: { allowNull: false, type: DataTypes.DOUBLE },
      parent: { type: DataTypes.INTEGER },
    },
    {
      timestamps: true,
      createdAt: true,
      updatedAt: "updateTimestamp",
    },
  );
  return sequelize.models.Comments;
}
