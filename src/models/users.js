import { DataTypes } from "sequelize";

export default function Users(sequelize) {
  sequelize.define(
    "Users",
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      authLevel: { allowNull: true, type: DataTypes.INTEGER },
      username: { unique: true, allowNull: false, type: DataTypes.STRING },
      email: { unique: true, type: DataTypes.STRING },
      password: { allowNull: false, type: DataTypes.STRING },
    },
    {
      timestamps: true,
      createdAt: true,
      updatedAt: "updateTimestamp",
    },
  );
  const userModel = sequelize.models.Users;
  return userModel;
}
