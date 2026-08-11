const { DataTypes } = require("sequelize");

module.exports = {
  name: "001_baseline",

  async up(queryInterface) {
    await queryInterface.createTable("Users", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      authLevel: { type: DataTypes.INTEGER },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updateTimestamp: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable("Pins", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      image: { type: DataTypes.STRING },
      authorid: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      title: { type: DataTypes.STRING, allowNull: false },
      comment: { type: DataTypes.STRING },
      lat: { type: DataTypes.DOUBLE, allowNull: false },
      lng: { type: DataTypes.DOUBLE, allowNull: false },
      parent: { type: DataTypes.INTEGER },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updateTimestamp: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable("Comments", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      replyLevel: { type: DataTypes.INTEGER, allowNull: false },
      authorid: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
      },
      comment: { type: DataTypes.STRING },
      PinParent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Pins", key: "id" },
      },
      CommentParent: { type: DataTypes.INTEGER },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updateTimestamp: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable("Sessions", {
      sid: { type: DataTypes.STRING(36), primaryKey: true },
      expires: { type: DataTypes.DATE },
      data: { type: DataTypes.TEXT },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },
};
