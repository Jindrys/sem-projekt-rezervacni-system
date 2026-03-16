const reservationService  = require('../../src/services/reservationService')
const notificationService = require('../../src/services/notificationService')
const { Reservation, User, Room } = require('../../src/models')

// Mock celého notificationService modulu
jest.mock('../../src/services/notificationService')

// Mock celého models modulu
jest.mock('../../src/models')

describe('cancelReservation', () => {

  // Před každým testem vyčisti všechny mocky
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('odešle e-mail o zrušení po úspěšném zrušení', async () => {
    // Arrange – nastav co mají mocky vracet
    const fakeReservation = {
      id: 1,
      status: 'active',
      startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // za 3 hodiny
      userId: 1,
      user: { email: 'jan@test.cz' },
      update: jest.fn().mockResolvedValue(true),
    }

    Reservation.findByPk.mockResolvedValue(fakeReservation)
    notificationService.sendCancellationEmail.mockResolvedValue(true)

    const requestingUser = { id: 1, role: 'user' }

    // Act
    await reservationService.cancelReservation({
      reservationId: 1,
      requestingUser,
    })

    // Assert – ověř že email byl odeslán se správnými parametry
    expect(notificationService.sendCancellationEmail).toHaveBeenCalledTimes(1)
    expect(notificationService.sendCancellationEmail).toHaveBeenCalledWith(
      'jan@test.cz',
      fakeReservation
    )
  })

  test('Neodesílá e-mail pokud zrušení není povoleno', async () => {
    // Arrange – rezervace začíná za 30 minut – nelze zrušit
    const fakeReservation = {
      id: 1,
      status: 'active',
      startTime: new Date(Date.now() + 30 * 60 * 1000), // za 30 minut
      userId: 1,
      user: { email: 'jan@test.cz' },
      update: jest.fn(),
    }

    Reservation.findByPk.mockResolvedValue(fakeReservation)

    const requestingUser = { id: 1, role: 'user' }

    // Act + Assert – očekáváme chybu
    await expect(
      reservationService.cancelReservation({ reservationId: 1, requestingUser })
    ).rejects.toThrow('méně než 1 hodinu')

    // Email nesmí být odeslán
    expect(notificationService.sendCancellationEmail).not.toHaveBeenCalled()
  })

  test('neodesílá e-maily pokud uživatel nemá oprávnění', async () => {
    // Arrange
    const fakeReservation = {
      id: 1,
      status: 'active',
      startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      userId: 1,  // vlastník je user 1
      user: { email: 'jan@test.cz' },
      update: jest.fn(),
    }

    Reservation.findByPk.mockResolvedValue(fakeReservation)

    const requestingUser = { id: 99, role: 'user' }  // jiný uživatel

    // Act + Assert
    await expect(
      reservationService.cancelReservation({ reservationId: 1, requestingUser })
    ).rejects.toThrow('oprávnění')

    expect(notificationService.sendCancellationEmail).not.toHaveBeenCalled()
  })
})