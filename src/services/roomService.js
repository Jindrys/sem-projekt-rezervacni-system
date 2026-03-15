const { Room } = require('../models')

async function getAllRooms() {
  return Room.findAll({ where: { isActive: true } })
}

async function getRoomById(id) {
  const room = await Room.findByPk(id)
  if (!room) {
    throw new Error('Místnost nebyla nalezena')
  }
  return room
}

async function createRoom({ name, capacity, description }) {
  return Room.create({ name, capacity, description })
}

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
}