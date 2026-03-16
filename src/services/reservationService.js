const { Reservation, Room, User } = require('../models')
const { Op } = require('sequelize')
const {
  hasTimeConflict,
  isCancellationAllowed,
  canUserModifyReservation,
  isWithinMaxDuration,
  isReservationInFuture,
} = require('../domain/rules')

const notificationService = require('./notificationService')

// Vytvoření rezervace
async function createReservation({ roomId, userId, startTime, endTime }) {
  const start = new Date(startTime)
  const end   = new Date(endTime)
  const now   = new Date()

  // Pravidlo 5: pouze do budoucnosti
  if (!isReservationInFuture(start, now)) {
    throw new Error('Rezervaci lze vytvořit pouze do budoucnosti')
  }

  // Pravidlo 4: max. 4 hodiny
  if (!isWithinMaxDuration(start, end)) {
    throw new Error('Rezervace nesmí přesáhnout 4 hodiny')
  }

  // Zkontroluj že místnost existuje
  const room = await Room.findByPk(roomId)
  if (!room) {
    throw new Error('Místnost nebyla nalezena')
  }

  // Načti existující rezervace pro danou místnost v daném čase
  const existingReservations = await Reservation.findAll({
    where: {
      roomId,
      status: 'active',
      // načti jen rezervace které se časově překrývají s požadovaným oknem
      startTime: { [Op.lt]: end },
      endTime:   { [Op.gt]: start },
    }
  })

  // Pravidlo 1: kolize
  if (hasTimeConflict(existingReservations, start, end)) {
    throw new Error('Místnost je v tomto čase již rezervována')
  }

  // Vše ok – vytvoř rezervaci
  const reservation = await Reservation.create({
    roomId,
    userId,
    startTime: start,
    endTime: end,
    status: 'active',
  })

  return reservation
}

// Zrušení rezervace
async function cancelReservation({ reservationId, requestingUser }) {
  const reservation = await Reservation.findByPk(reservationId, {
    include: [{ model: User, as: 'user' }]
  })

  if (!reservation) {
    throw new Error('Rezervace nebyla nalezena')
  }

  if (reservation.status === 'cancelled') {
    throw new Error('Rezervace je již zrušena')
  }

  // Pravidlo 3: oprávnění
  if (!canUserModifyReservation(requestingUser, reservation)) {
    throw new Error('Nemáte oprávnění zrušit tuto rezervaci')
  }

  // Pravidlo 2: čas zrušení
  if (!isCancellationAllowed(reservation.startTime, new Date())) {
    throw new Error('Rezervaci nelze zrušit méně než 1 hodinu před začátkem')
  }

  await reservation.update({ status: 'cancelled' })

  // Pošli notifikaci – tohle budeme mockovat v testech
  await notificationService.sendCancellationEmail(
    reservation.user.email,
    reservation
  )

  return reservation
}

// Načtení rezervací pro místnost
async function getReservationsForRoom(roomId) {
  const room = await Room.findByPk(roomId)
  if (!room) {
    throw new Error('Místnost nebyla nalezena')
  }

  return Reservation.findAll({
    where: { roomId, status: 'active' },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['startTime', 'ASC']],
  })
}

// Načtení rezervací uživatele
async function getReservationsForUser(userId) {
  return Reservation.findAll({
    where: { userId, status: 'active' },
    include: [{ model: Room, as: 'room', attributes: ['id', 'name', 'capacity'] }],
    order: [['startTime', 'ASC']],
  })
}

module.exports = {
  createReservation,
  cancelReservation,
  getReservationsForRoom,
  getReservationsForUser,
}