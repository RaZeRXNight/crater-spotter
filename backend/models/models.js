import { DataTypes } from "sequelize";

export default function Users(sequelize) {
  sequelize.define(
    "Users",
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      authLevel: { allowNull: true, type: DataTypes.INTEGER },
      username: { allowNull: false, type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      createdAt: true,
      updatedAt: "updateTimestamp",
    },
  );
  return sequelize.models.Users;
}
