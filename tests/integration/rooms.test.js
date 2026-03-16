const request = require('supertest')
const app     = require('../../src/app')
const { Room } = require('../../src/models')

require('./setup')

// Pomocné hlavičky – simulují přihlášeného uživatele
const userHeaders  = { 'x-user-id': '1', 'x-user-role': 'user' }
const adminHeaders = { 'x-user-id': '2', 'x-user-role': 'admin' }

describe('GET /rooms', () => {

  test('returns empty array when no rooms exist', async () => {
    // Act
    const res = await request(app)
      .get('/rooms')
      .set(userHeaders)

    // Assert
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('returns list of active rooms', async () => {
    // Arrange – vytvoř místnost přímo v DB
    await Room.create({ name: 'Místnost A', capacity: 10 })

    // Act
    const res = await request(app)
      .get('/rooms')
      .set(userHeaders)

    // Assert
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Místnost A')
  })
})

describe('POST /rooms', () => {

  test('creates a room successfully', async () => {
    // Act
    const res = await request(app)
      .post('/rooms')
      .set(adminHeaders)
      .send({ name: 'Konferenční sál', capacity: 20 })

    // Assert
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Konferenční sál')
    expect(res.body.capacity).toBe(20)
    expect(res.body.id).toBeDefined()
  })

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/rooms')
      .set(adminHeaders)
      .send({ capacity: 10 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  test('returns 401 when no auth headers provided', async () => {
    const res = await request(app)
      .post('/rooms')
      .send({ name: 'Test', capacity: 5 })

    expect(res.status).toBe(401)
  })
})