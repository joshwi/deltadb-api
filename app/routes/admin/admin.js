const express = require("express")
const router = express.Router()
const utility = require("../../utility/utility")

const db = require('./database/neo4j')

router.use("/db", db)

router.route("/cache/:id").get(async function (req, res) {
    let cache = await utility.redis.getCache(req.params.id)

    try { cache = cache ? JSON.parse(cache) : [{}] }
    catch (err) { cache = [{}] }

    let active = cache.filter(x => x.status === "In Progress").length
    let complete = cache.filter(x => x.status === "Completed").length

    if (active || complete) {
        if (active > 0) { res.status(409) } else { res.status(200) }
        return res.json(cache)
    } else {
        return res.status(400).json({ message: "No Cache found for Correlation ID", correlationID: req.params.id })
    }

})

module.exports = router