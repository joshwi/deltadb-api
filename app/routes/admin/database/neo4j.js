const express = require("express")
const router = express.Router()

const locals = require("../../../utility/utility")
const utils = require("@jshwilliams/node-utils")

router.route("/status").get(async function (req, res) {
    let output = await utils.neo4j.connectionStatus(locals.db.driver)
    return res.send(output)
})

router.route("/keys").get(async function (req, res) {
    let output = {}
    let keys = await utils.neo4j.runCypher(locals.db.driver, "MATCH (n:keys) RETURN n", res.locals.correlation)
    try {
        keys.records.map(entry => { if (entry.n.label) { output[entry.n.label] = entry.n } })
        res.status(200)
    } catch (error) {
        output = { message: "Neo4j keys not found!", correlationID: res.locals.correlation, error: error }
        res.status(400)
    }
    return res.json(output)
})

router.route("/keys/:key").get(async function (req, res) {

    let result = { label: req.params.key, headers: [], keys: [] }

    if (req.params.key) {
        query = `MATCH (m:${req.params.key})\nUNWIND keys(m) AS key\nRETURN collect(distinct key) as n`
        let properties = await utils.neo4j.runCypher(locals.db.driver, query, res.locals.correlation)
        try { properties = properties.records[0].n } catch (err) { properties = [] }
        properties.filter(x => x != "_labels" && x != "_id")
        await properties.map(entry => {
            header = entry.replace(/\_/g, " ")
            result.headers.push(header)
            result.keys.push(entry)
        })
        let output = `MERGE (:keys {label: "${result.label}", headers: ${JSON.stringify(result.headers)}, keys: ${JSON.stringify(result.keys)} })`
        res.status(200).send(output)
    }
    res.status(400).send("NO")
})

router.route("/query").post(async function (req, res) {
    if (req.body && req.body.cypher) {
        let response = await utils.neo4j.runCypher(locals.db.driver, req.body.cypher, res.locals.correlation)
        res.status(200).send({ message: "Neo4j Cypher Query", correlationID: res.locals.correlation, status: "Completed", query: req.body.cypher, ...response })
    } else {
        res.status(400).send({ message: "Neo4j Cypher Command Failed", correlationID: res.locals.correlation, error: "Invalid body in POST request" })
    }
})

router.route("/cypher").post(async function (req, res) {
    if (req.body && req.body.cypher) {
        res.status(200).send({ message: "Neo4j Cypher Command Running", correlationID: res.locals.correlation })
        let cache = [{ message: "Neo4j Cypher Query", correlationID: res.locals.correlation, status: "In Progress", query: req.body.cypher }]
        await locals.redis.setCache(res.locals.correlation, JSON.stringify(cache))
        let response = await utils.neo4j.runCypher(locals.db.driver, req.body.cypher, res.locals.correlation)
        cache = [{ message: "Neo4j Cypher Query", correlationID: res.locals.correlation, status: "Completed", query: req.body.cypher, ...response }]
        await locals.redis.setCache(res.locals.correlation, JSON.stringify(cache))
    } else {
        res.status(400).send({ message: "Neo4j Cypher Command Failed", correlationID: res.locals.correlation, error: "Invalid body in POST request" })
    }
})

router.route("/transactions/:folder/:category/:file").post(async function (req, res) {

    let cypher, status
    let filepath = `/app/static/json/transactions/${req.params.folder}/${req.params.category}`


    let commands = locals.storage.read(`${filepath}/${req.params.file}.json`)
    if (commands.length > 0) {
        cypher = [{ file: `${req.params.file}.json`, commands: commands }]
        status = [{ message: "Neo4j Transaction Status", file: `${req.params.file}.json`, correlationID: res.locals.correlation, status: "In Progress" }]
        res.status(200).json({ message: "Neo4j Transaction Running", correlationID: res.locals.correlation })
    } else {
        res.status(400).json({ message: "Neo4j Transaction Failed", correlationID: res.locals.correlation, error: `No such file > ${filepath}/${req.params.file}.json` })
    }

    await locals.redis.setCache(res.locals.correlation, JSON.stringify(status))

    cypher.map(async item => {
        await utils.neo4j.runTransactions(locals.db.driver, item.commands, res.locals.correlation)
        status.filter(x => x.file === item.file).map(entry => entry.status = "Completed")
        await locals.redis.setCache(res.locals.correlation, JSON.stringify(status))
    })

})

router.route("/format_values").get(async function (req, res) {
    let query = `MATCH (m)\nUNWIND labels(m) AS label\nRETURN collect(distinct label) as n`
    let nodes = await utils.neo4j.runCypher(locals.db.driver, query, res.locals.correlation)
    try { nodes = nodes.records[0].n } catch (err) { nodes = [] }
    await nodes.map(async entry => {
        query = `MATCH (m:${entry})\nUNWIND keys(m) AS key\nRETURN collect(distinct key) as n`
        let properties = await utils.neo4j.runCypher(locals.db.driver, query, res.locals.correlation)
        try { properties = properties.records[0].n } catch (err) { properties = [] }
        properties.map(async index => {
            query = `MATCH (n:${entry}) WHERE n.${index} is Null SET n.${index}=""`
            await utils.neo4j.runCypher(locals.db.driver, query, res.locals.correlation)
        })

    })

    res.status(200).json({ message: "Neo4j Function", correlationID: res.locals.correlation, function: "Null Properties to String", status: "Completed" })
})

module.exports = router