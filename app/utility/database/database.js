const neo4j = require("neo4j-driver")
require("dotenv").config()

const NEO4J_SERVICE_HOST = process.env.NEO4J_SERVICE_HOST
const NEO4J_SERVICE_PORT = process.env.NEO4J_SERVICE_PORT
const username = process.env.NEO4J_USERNAME
const password = process.env.NEO4J_PASSWORD
const uri = `bolt://${NEO4J_SERVICE_HOST}:${NEO4J_SERVICE_PORT}`
const driver = neo4j.driver(uri, neo4j.auth.basic(username, password), { disableLosslessIntegers: true })

module.exports = {driver}