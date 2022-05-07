const express = require("express")
const router = express.Router()

const locals = require("../utility/utility")
const utils = require("@jshwilliams/node-utils")

router.route("/:node/:label?").get(async function (req, res) {
    req.query.fields = req.query.fields ? req.query.fields.split(",") : []
    req.query.limit = req.query.limit ? req.query.limit : 10
    req.query.filter = req.params.label ? `n.label="${req.params.label}"` : req.query.filter
    let output = await utils.neo4j.getNode(locals.db.driver, req.params.node, req.query, res.locals.correlation)
    return res.status(200).json(output)
}).post(async function (req, res) {
    let output = await utils.neo4j.postNode(locals.db.driver, req.params.node, req.params.label, req.body, res.locals.correlation)
    return res.status(200).json(output)
}).put(async function (req, res) {
    let output = await utils.neo4j.putNode(locals.db.driver, req.params.node, req.params.label, req.body, res.locals.correlation)
    return res.status(200).json(output)
}).delete(async function (req, res) {
    let output = await utils.neo4j.deleteNode(locals.db.driver, req.params.node, req.params.label, res.locals.correlation)
    return res.status(200).json(output)
})

module.exports = router