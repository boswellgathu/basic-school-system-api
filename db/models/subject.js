/* eslint-disable func-names */

module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    
  }, {});
  Subject.associate = function(models) {
  };
  return Subject;
};
