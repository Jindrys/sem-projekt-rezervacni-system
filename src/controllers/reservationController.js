const reservationService = require('../services/reservationService')

async function createReservation(req, res) {
  try {
    const { roomId, startTime, endTime } = req.body
    const userId = req.user.id  // přijde z auth middleware

    const reservation = await reservationService.createReservation({
      roomId,
      userId,
      startTime,
      endTime,
    })

    return res.status(201).json(reservation)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

async function cancelReservation(req, res) {
  try {
    const reservationId   = parseInt(req.params.id)
    const requestingUser  = req.user

    const reservation = await reservationService.cancelReservation({
      reservationId,
      requestingUser,
    })

    return res.status(200).json(reservation)
  } catch (err) {
    // 403 pro oprávnění, 400 pro ostatní chyby
    const status = err.message.includes('oprávnění') ? 403 : 400
    return res.status(status).json({ error: err.message })
  }
}

async function getReservationsForRoom(req, res) {
  try {
    const roomId = parseInt(req.params.roomId)
    const reservations = await reservationService.getReservationsForRoom(roomId)
    return res.status(200).json(reservations)
  } catch (err) {
    return res.status(404).json({ error: err.message })
  }
}

async function getMyReservations(req, res) {
  try {
    const userId = req.user.id
    const reservations = await reservationService.getReservationsForUser(userId)
    return res.status(200).json(reservations)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

module.exports = {
  createReservation,
  cancelReservation,
  getReservationsForRoom,
  getMyReservations,
}