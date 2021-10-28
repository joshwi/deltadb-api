const express = require("express")
const router = express.Router()
const neo4j = require("neo4j-driver")
require("dotenv").config()

const NEO4J_SERVICE_HOST = process.env.NEO4J_SERVICE_HOST
const NEO4J_SERVICE_PORT = process.env.NEO4J_SERVICE_PORT
const username = process.env.NEO4J_USERNAME
const password = process.env.NEO4J_PASSWORD
const uri = `bolt://${NEO4J_SERVICE_HOST}:${NEO4J_SERVICE_PORT}`
const driver = neo4j.driver(uri, neo4j.auth.basic(username, password), { disableLosslessIntegers: true })

const locals = require("../../../utility/utility")
const utils = require("@jshwilliams/node-utils")

router.route("/connection").get(async function (req, res) {
    let output = await utils.neo4j.connectionStatus(driver)
    return res.send(output)
})

router.route("/nulltostring").get(async function (req, res) {
    let query = `MATCH (m)\nUNWIND labels(m) AS label\nRETURN collect(distinct label) as n`
    let nodes = await utils.neo4j.runCypher(driver, query, res.locals.correlation)
    try{ nodes = nodes.records[0].n }catch(err){ nodes = []}
    await nodes.map(async entry => {
        query = `MATCH (m:${entry})\nUNWIND keys(m) AS key\nRETURN collect(distinct key) as n`
        let properties = await utils.neo4j.runCypher(driver, query, res.locals.correlation)
        try{ properties = properties.records[0].n }catch(err){ properties = []}
        properties.map(async index => {
            query = `MATCH (n:${entry}) WHERE n.${index} is Null SET n.${index}=""`
            await utils.neo4j.runCypher(driver, query, res.locals.correlation)
        })

    })

    res.status(200).json({ message: "Neo4j Function", correlationID: res.locals.correlation, function: "Null Properties to String", status: "Completed" })
})

router.route("/keys").get(async function (req, res) {
    let output = {}
    let keys = await utils.neo4j.runCypher(driver, "MATCH (n:keys) RETURN n", res.locals.correlation)
    try {
        keys.records.map(entry => { if (entry.n.label) { output[entry.n.label] = entry.n } })
        res.status(200)
    } catch (error) {
        output = { message: "Neo4j keys not found!", correlationID: res.locals.correlation, error: error }
        res.status(400)
    }
    return res.json(output)
})

router.route("/cypher").post(async function (req, res) {
    if (req.body && req.body.cypher) {
        res.status(200).send({ message: "Neo4j Cypher Command Running", correlationID: res.locals.correlation })
        let cache = [{ message: "Neo4j Cypher Query", correlationID: res.locals.correlation, status: "In Progress", query: req.body.cypher }]
        await locals.redis.setCache(res.locals.correlation, JSON.stringify(cache))
        let response = await utils.neo4j.runCypher(driver, req.body.cypher, res.locals.correlation)
        cache = [{ message: "Neo4j Cypher Query", correlationID: res.locals.correlation, status: "Completed", query: req.body.cypher, ...response }]
        await locals.redis.setCache(res.locals.correlation, JSON.stringify(cache))
    } else {
        res.status(400).send({ message: "Neo4j Cypher Command Failed", correlationID: res.locals.correlation, error: "Invalid body in POST request" })
    }
})

router.route("/transactions/:folder/:file?").post(async function (req, res) {

    let cypher, status
    let filepath = `json/transactions/${req.params.folder}`

    if (!req.params.file) {
        files = locals.storage.scan(filepath)
        if (files.length > 0) {
            cypher = files.filter(x => x.includes(".json")).map(entry => { return { file: entry, commands: locals.storage.read(`${filepath}/${entry}`) } })
            status = files.filter(x => x.includes(".json")).map(entry => { return { message: "Neo4j Transaction Status", file: entry, correlationID: res.locals.correlation, status: "In Progress" } })
            res.status(200).json({ message: "Neo4j Transaction Running", correlationID: res.locals.correlation })
        } else {
            res.status(400).json({ message: "Neo4j Transaction Failed", correlationID: res.locals.correlation, error: `No such directory > ${filepath}` })
        }

    } else {
        let commands = locals.storage.read(`${filepath}/${req.params.file}.json`)
        if (commands.length > 0) {
            cypher = [{ file: req.params.file, commands: commands }]
            status = [{ message: "Neo4j Transaction Status", file: `${req.params.file}.json`, correlationID: res.locals.correlation, status: "In Progress" }]
            res.status(200).json({ message: "Neo4j Transaction Running", correlationID: res.locals.correlation })
        } else {
            res.status(400).json({ message: "Neo4j Transaction Failed", correlationID: res.locals.correlation, error: `No such file > ${filepath}/${req.params.file}.json` })
        }
    }

    await locals.redis.setCache(res.locals.correlation, JSON.stringify(status))

    cypher.map(async item => {
        await utils.neo4j.runTransactions(driver, item.commands, res.locals.correlation)
        status.filter(x => x.file === item.file).map(entry => entry.status = "Completed")
        await locals.redis.setCache(res.locals.correlation, JSON.stringify(status))
    })

})

router.route("/node/:node/:label?").get(async function (req, res) {
    req.query.fields = req.query.fields ? req.query.fields.split(",") : []
    req.query.limit = req.query.limit ? req.query.limit : 100
    let output = await utils.neo4j.getNode(driver, req.params.node, req.query, res.locals.correlation)
    return res.status(200).json(output)
}).post(async function (req, res) {
    let output = await utils.neo4j.postNode(driver, req.params.node, req.params.label, req.body, res.locals.correlation)
    return res.status(200).json(output)
}).put(async function (req, res) {
    let output = await utils.neo4j.putNode(driver, req.params.node, req.params.label, req.body, res.locals.correlation)
    return res.status(200).json(output)
}).delete(async function (req, res) {
    let output = await utils.neo4j.deleteNode(driver, req.params.node, req.params.label, res.locals.correlation)
    return res.status(200).json(output)
})

module.exports = router