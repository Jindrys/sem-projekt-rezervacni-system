const { sequelize } = require('../../src/models')

// Spustí se jednou před všemi testy v souboru
beforeAll(async () => {
  // Připojí se k testovací DB a vytvoří tabulky
  await sequelize.sync({ force: true })
})

// Spustí se před každým jednotlivým testem
beforeEach(async () => {
  // Vymaže všechna data aby každý test začínal čistě
  await sequelize.truncate({ cascade: true, restartIdentity: true })
})

// Spustí se jednou po všech testech
afterAll(async () => {
  await sequelize.close()
})