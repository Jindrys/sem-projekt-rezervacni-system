const MAX_DURATION_HOURS = 4
const MIN_CANCELLATION_HOURS = 1

// Pomocná funkce – výpočet rozdílu dvou datumů v hodinách
function diffInHours(dateA, dateB) {
  return (dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60)
}

/*
  Pravidlo 1: Zkontroluje zda nová rezervace časově koliduje s existujícími.
  Kolize nastane pokud: newStart < existingEnd AND newEnd > existingStart
 */
function hasTimeConflict(existingReservations, newStart, newEnd) {
  return existingReservations.some(reservation =>
    newStart < reservation.endTime && newEnd > reservation.startTime
  )
}

/*
  Pravidlo 2: Zrušení je povoleno pouze více než 1 hodinu před začátkem.
  Přijímá `now` jako parametr – snadnější testování, žádná závislost na systémovém čase.
 */
function isCancellationAllowed(startTime, now) {
  return diffInHours(startTime, now) > MIN_CANCELLATION_HOURS
}

/*
  Pravidlo 3: Rezervaci může upravit vlastník nebo admin.
 */
function canUserModifyReservation(user, reservation) {
  return user.role === 'admin' || user.id === reservation.userId
}

/*
  Pravidlo 4: Rezervace nesmí přesáhnout MAX_DURATION_HOURS.
 */
function isWithinMaxDuration(startTime, endTime) {
  return diffInHours(endTime, startTime) <= MAX_DURATION_HOURS
}

/*
  Pravidlo 5: Rezervace musí být v budoucnosti.
  Přijímá `now` jako parametr – stejný důvod jako u pravidla 2.
 */
function isReservationInFuture(startTime, now) {
  return diffInHours(startTime, now) > 0
}

module.exports = {
  hasTimeConflict,
  isCancellationAllowed,
  canUserModifyReservation,
  isWithinMaxDuration,
  isReservationInFuture,
}