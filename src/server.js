require('dotenv').config()
const app = require('./app')
const { sequelize } = require('./models')

const PORT = process.env.PORT || 3000

async function start() {
  await sequelize.sync({ alter: true })
  app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`)
  })
}

start()