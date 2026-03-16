async function sendCancellationEmail(userEmail, reservation) {
  // V reálné aplikaci by zde bylo volání SMTP / SendGrid / apod.
  console.log(`Email odeslan na ${userEmail}: rezervace ${reservation.id} zrusena`)
  return true
}

module.exports = { sendCancellationEmail }