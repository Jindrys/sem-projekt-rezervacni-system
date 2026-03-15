const sequelize = require('../config/database')
const User = require('./User')
const Room = require('./Room')
const Reservation = require('./Reservation')

// User má mnoho Reservation (1:N)
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' })
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Room má mnoho Reservation (1:N)
Room.hasMany(Reservation, { foreignKey: 'roomId', as: 'reservations' })
Reservation.belongsTo(Room, { foreignKey: 'roomId', as: 'room' })

module.exports = { sequelize, User, Room, Reservation }