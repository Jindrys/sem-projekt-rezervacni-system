/*
Business pravidla

Rezervaci nelze vytvořit na obsazený slot (kolize)
Rezervaci nelze zrušit méně než 1 hodinu před začátkem
Pouze vlastník nebo admin může zrušit rezervaci
Délka rezervace max. 4 hodiny
Rezervace pouze do budoucnosti (ne zpětně)
*/

const {
  hasTimeConflict,
  isCancellationAllowed,
  isReservationInFuture,
  isWithinMaxDuration,
  canUserModifyReservation,
} = require('../../src/domain/rules')

// Pravidlo 1: Kolize rezervací

describe('hasTimeConflict', () => {
  
  // AAA: Arrange / Act / Assert
  test('Vrátí true když nová rezervace překrývá již existující', () => {
    // Arrange – existující rezervace 10:00–12:00
    const existing = [
      { startTime: new Date('2025-06-01T10:00:00'), endTime: new Date('2025-06-01T12:00:00') }
    ]
    // nová rezervace 11:00–13:00 – překryv!
    const newStart = new Date('2025-06-01T11:00:00')
    const newEnd   = new Date('2025-06-01T13:00:00')

    // Act
    const result = hasTimeConflict(existing, newStart, newEnd)

    // Assert
    expect(result).toBe(true)
  })

  test('vrátí false pokud nová rezervace následuje po existující rezervaci', () => {
    const existing = [
      { startTime: new Date('2025-06-01T10:00:00'), endTime: new Date('2025-06-01T12:00:00') }
    ]
    const newStart = new Date('2025-06-01T12:00:00')
    const newEnd   = new Date('2025-06-01T14:00:00')

    const result = hasTimeConflict(existing, newStart, newEnd)

    expect(result).toBe(false)
  })

  test('vrátí false pokud je nová rezervace před existující', () => {
    const existing = [
      { startTime: new Date('2025-06-01T10:00:00'), endTime: new Date('2025-06-01T12:00:00') }
    ]
    const newStart = new Date('2025-06-01T08:00:00')
    const newEnd   = new Date('2025-06-01T10:00:00')

    const result = hasTimeConflict(existing, newStart, newEnd)

    expect(result).toBe(false)
  })

  test('returns false when there are no existing reservations', () => {
    const result = hasTimeConflict([], new Date('2025-06-01T10:00:00'), new Date('2025-06-01T12:00:00'))
    expect(result).toBe(false)
  })
})

// Pravidlo 2: Zrušení méně než 1h před začátkem

describe('isCancellationAllowed', () => {

  test('vrátí hodnotu true pokud je zrušení více než 1 hodinu před začátkem', () => {
    const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000) // za 2 hodiny
    const now = new Date()

    const result = isCancellationAllowed(startTime, now)

    expect(result).toBe(true)
  })

  test('vrátí hodnotu false pokud je zrušení méně než 1 hodina před začátkem', () => {
    const startTime = new Date(Date.now() + 30 * 60 * 1000) // za 30 minut
    const now = new Date()

    const result = isCancellationAllowed(startTime, now)

    expect(result).toBe(false)
  })

  test('vrátí hodnotu false při pokusu o zrušení předchozí rezervace', () => {
    const startTime = new Date(Date.now() - 60 * 60 * 1000) // hodinu zpět
    const now = new Date()

    const result = isCancellationAllowed(startTime, now)

    expect(result).toBe(false)
  })
})

// Pravidlo 3: Oprávnění ke změně rezervace

describe('canUserModifyReservation', () => {

  test('vrací hodnotu true pokud je uživatel vlastníkem rezervace', () => {
    const user        = { id: 1, role: 'user' }
    const reservation = { userId: 1 }

    expect(canUserModifyReservation(user, reservation)).toBe(true)
  })

  test('vrací hodnotu true pokud je uživatel administrátorem (i když není vlastníkem))', () => {
    const user        = { id: 2, role: 'admin' }
    const reservation = { userId: 1 }

    expect(canUserModifyReservation(user, reservation)).toBe(true)
  })

  test('vrátí false pokud uživatel není vlastníkem ani administrátorem', () => {
    const user        = { id: 3, role: 'user' }
    const reservation = { userId: 1 }

    expect(canUserModifyReservation(user, reservation)).toBe(false)
  })
})

// Pravidlo 4: Max. délka rezervace 4 hodiny

describe('isWithinMaxDuration', () => {

  test('vrátí hodnotu true pokud je rezervace přesně 4 hodiny', () => {
    const start = new Date('2025-06-01T10:00:00')
    const end   = new Date('2025-06-01T14:00:00')

    expect(isWithinMaxDuration(start, end)).toBe(true)
  })

  test('vrátí hodnotu false pokud rezervace překročí 4 hodiny', () => {
    const start = new Date('2025-06-01T10:00:00')
    const end   = new Date('2025-06-01T15:00:00')

    expect(isWithinMaxDuration(start, end)).toBe(false)
  })

  test('vrátí hodnotu true pokud je rezervace 1 hodina', () => {
    const start = new Date('2025-06-01T10:00:00')
    const end   = new Date('2025-06-01T11:00:00')

    expect(isWithinMaxDuration(start, end)).toBe(true)
  })
})

// Pravidlo 5: Rezervace pouze do budoucnosti

describe('isReservationInFuture', () => {

  test('vrací hodnotu true pokud je čas začátku v budoucnosti', () => {
    const startTime = new Date(Date.now() + 60 * 60 * 1000) // za hodinu
    const now = new Date()

    expect(isReservationInFuture(startTime, now)).toBe(true)
  })

  test('vrátí hodnotu false pokud je čas začátku v minulosti', () => {
    const startTime = new Date(Date.now() - 60 * 60 * 1000) // hodinu zpět
    const now = new Date()

    expect(isReservationInFuture(startTime, now)).toBe(false)
  })

  test('vrátí false když je čas zahájení právě teď', () => {
    const now = new Date()

    expect(isReservationInFuture(now, now)).toBe(false)
  })
})