const express = require('express')
const app = express()

app.use(express.json())  

app.use((req, res, next) => {
  const userId   = parseInt(req.headers['x-user-id'])
  const userRole = req.headers['x-user-role'] || 'user'

  if (!userId) {
    return res.status(401).json({ error: 'Neautorizovaný přístup' })
  }

  req.user = { id: userId, role: userRole }
  next()
})

// Routes
const reservationController = require('./controllers/reservationController')
const roomController         = require('./controllers/roomController')

// Místnosti
app.get('/rooms',          roomController.getAllRooms)
app.get('/rooms/:id',      roomController.getRoomById)
app.post('/rooms',         roomController.createRoom)

// Rezervace
app.post('/reservations',                      reservationController.createReservation)
app.patch('/reservations/:id/cancel',          reservationController.cancelReservation)
app.get('/rooms/:roomId/reservations',         reservationController.getReservationsForRoom)
app.get('/my-reservations',                    reservationController.getMyReservations)

// Health check endpoint – používá ho Kubernetes pro liveness probe
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

module.exports = app