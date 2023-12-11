module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("record", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleId: {
      type: DataTypes.INTEGER,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentOrganization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return User;
};