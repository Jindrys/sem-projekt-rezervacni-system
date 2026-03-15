const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME     || 'reservation_db',
  process.env.DB_USER     || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host:    process.env.DB_HOST    || 'localhost',
    port:    process.env.DB_PORT    || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false, // vypne SQL logy v konzoli během testů
  }
)

module.exports = sequelize