const request = require('supertest')
const app     = require('../../src/app')
const { Room, User, Reservation } = require('../../src/models')

require('./setup')

const userHeaders  = { 'x-user-id': '1', 'x-user-role': 'user' }
const adminHeaders = { 'x-user-id': '2', 'x-user-role': 'admin' }

// Pomocná funkce – vytvoří testovací data v DB
async function createTestData() {
  const room = await Room.create({ name: 'Testovací místnost', capacity: 10 })
  const user = await User.create({
    id: 1,
    name: 'Jan Novák',
    email: 'jan@test.cz',
    password: 'heslo123',
    role: 'user',
  })
  return { room, user }
}

// Pomocná funkce – vrátí čas relativně od teď (v hodinách)
function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

describe('POST /reservations', () => {

  test('creates reservation successfully', async () => {
    // Arrange
    const { room } = await createTestData()

    // Act
    const res = await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(2),  // za 2 hodiny
        endTime:   hoursFromNow(3),  // za 3 hodiny
      })

    // Assert
    expect(res.status).toBe(201)
    expect(res.body.roomId).toBe(room.id)
    expect(res.body.status).toBe('active')
  })

  test('returns 400 when reservation is in the past', async () => {
    const { room } = await createTestData()

    const res = await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(-3),  // 3 hodiny zpět
        endTime:   hoursFromNow(-2),
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('budoucnosti')
  })

  test('returns 400 when reservation exceeds 4 hours', async () => {
    const { room } = await createTestData()

    const res = await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(1),
        endTime:   hoursFromNow(6),  // 5 hodin – příliš dlouhé
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('4 hodiny')
  })

  test('returns 400 when room is already reserved', async () => {
    const { room } = await createTestData()

    // Arrange – vytvoř první rezervaci
    await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(2),
        endTime:   hoursFromNow(4),
      })

    // Act – pokus o druhou rezervaci ve stejný čas
    const res = await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(3),  // překryv!
        endTime:   hoursFromNow(5),
      })

    // Assert
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('již rezervována')
  })
})

describe('PATCH /reservations/:id/cancel', () => {

  test('owner can cancel their reservation', async () => {
    const { room } = await createTestData()

    // Vytvoř rezervaci
    const createRes = await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(3),
        endTime:   hoursFromNow(4),
      })

    const reservationId = createRes.body.id

    // Zruš ji
    const cancelRes = await request(app)
      .patch(`/reservations/${reservationId}/cancel`)
      .set(userHeaders)

    expect(cancelRes.status).toBe(200)
    expect(cancelRes.body.status).toBe('cancelled')
  })

  test('returns 403 when user tries to cancel someone elses reservation', async () => {
    const { room } = await createTestData()

    const createRes = await request(app)
      .post('/reservations')
      .set(userHeaders)  // vytvoří uživatel 1
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(3),
        endTime:   hoursFromNow(4),
      })

    const reservationId = createRes.body.id

    // Pokus o zrušení jiným uživatelem (id: 99)
    const cancelRes = await request(app)
      .patch(`/reservations/${reservationId}/cancel`)
      .set({ 'x-user-id': '99', 'x-user-role': 'user' })

    expect(cancelRes.status).toBe(403)
    expect(cancelRes.body.error).toContain('oprávnění')
  })

  test('admin can cancel any reservation', async () => {
    const { room } = await createTestData()

    const createRes = await request(app)
      .post('/reservations')
      .set(userHeaders)
      .send({
        roomId:    room.id,
        startTime: hoursFromNow(3),
        endTime:   hoursFromNow(4),
      })

    const reservationId = createRes.body.id

    const cancelRes = await request(app)
      .patch(`/reservations/${reservationId}/cancel`)
      .set(adminHeaders)  // admin ruší cizí rezervaci

    expect(cancelRes.status).toBe(200)
    expect(cancelRes.body.status).toBe('cancelled')
  })
})