const { Pool, Client } = require('pg')
const credentials = require('./credentials')

const client = new Client(credentials)
const pool = new Pool(credentials)


module.exports = pool