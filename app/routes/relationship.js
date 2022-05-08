const express = require("express")
const router = express.Router()
const chalk = require("chalk")

const locals = require("../utility/utility")
const utils = require("@jshwilliams/node-utils")

async function getRelationship(driver, source, target, label, query, correlationID){

    let cypher = `MATCH p=(a:${source})-[]->(b:${target}) `

    if(label && query.filter){
        cypher += `WHERE a.label="${label}" AND ${query.filter} `
    }else if(!label && query.filter){
        cypher += `WHERE ${query.filter} `
    }else if(label && !query.filter){
        cypher += `WHERE a.label="${label}" `
    }

    cypher += `WITH a, b LIMIT ${query.limit ? query.limit : 100} RETURN collect(distinct a) as source, collect(distinct b) as target, collect(distinct {source: a.label, target: b.label}) as link`

    let output = await utils.neo4j.runCypher(driver, cypher, correlationID)

    utils.log.info(`${correlationID} ${chalk.cyan("function")}=getRelationship ${chalk.cyan("status")}=success ${chalk.cyan("source")}=${source} ${chalk.cyan("target")}=${target} ${chalk.cyan("label")}=${label}`)

    return output
}

router.route("/:source/:target/:label?").get(async function (req, res) {

    let output = await getRelationship(locals.db.driver, req.params.source, req.params.target, req.params.label, req.query, res.locals.correlation)
    locals.redis.setCache(res.locals.req_url, JSON.stringify(output))
    return res.status(200).json(output)
})

module.exports = router