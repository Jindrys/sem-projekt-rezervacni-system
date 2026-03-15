const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,  // nesmí být prázdný string
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,      // každý email jen jednou
    validate: {
      isEmail: true,   // Sequelize zkontroluje formát emailu
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'users',
  timestamps: true,  // Sequelize automaticky přidá createdAt a updatedAt
})

module.exports = User