const roomService = require('../services/roomService')

async function getAllRooms(req, res) {
  try {
    const rooms = await roomService.getAllRooms()
    return res.status(200).json(rooms)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

async function getRoomById(req, res) {
  try {
    const room = await roomService.getRoomById(parseInt(req.params.id))
    return res.status(200).json(room)
  } catch (err) {
    return res.status(404).json({ error: err.message })
  }
}

async function createRoom(req, res) {
  try {
    const { name, capacity, description } = req.body
    const room = await roomService.createRoom({ name, capacity, description })
    return res.status(201).json(room)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

module.exports = { getAllRooms, getRoomById, createRoom }