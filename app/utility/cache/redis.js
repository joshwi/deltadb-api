const redis = require("redis")
const { promisify } = require("util")

require("dotenv").config()

const REDIS_SERVICE_HOST = process.env.REDIS_SERVICE_HOST

const client = redis.createClient({
    host: REDIS_SERVICE_HOST,
    port: 6379
})

client.on("error", function (err) {
    console.log({message: "Redis Client Error", error: err});
});

const getCache = promisify(client.get).bind(client)
const setCache = promisify(client.set).bind(client)

module.exports = {getCache, setCache}