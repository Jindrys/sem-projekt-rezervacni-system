if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  require('dotenv').config()
}
const app = require('./app')
const { sequelize } = require('./models')

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await sequelize.sync({ alter: true })
    console.log('Databáze synchronizována')
    app.listen(PORT, () => {
      console.log(`Server běží na portu ${PORT}`)
    })
  } catch (err) {
    console.error('Chyba při spuštění serveru:', err)
    process.exit(1)
  }
}

start()