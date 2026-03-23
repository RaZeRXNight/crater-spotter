import { DataTypes } from "sequelize";

export default function Pins(sequelize, userModel) {
  sequelize.define(
    "Pins",
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      // authorid: {
      //   allowNull: false,
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: userModel,
      //     key: "id",
      //   },
      // },
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
  return sequelize.models.Pins;
}
