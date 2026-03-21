import { DataTypes } from "sequelize";

export default function Pins(sequelize) {
  sequelize.define(
    "Pins",
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
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
