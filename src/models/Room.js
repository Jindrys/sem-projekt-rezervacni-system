const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,  // kapacita musí být aspoň 1
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,  // místnost je aktivní dokud ji nevypneš
  }
}, {
  tableName: 'rooms',
  timestamps: true,
})

module.exports = Room