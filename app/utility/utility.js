const redis = require("./cache/redis")
const storage = require("./storage/storage")
const db = require("./database/database")

module.exports.redis = redis
module.exports.storage = storage
module.exports.db = db