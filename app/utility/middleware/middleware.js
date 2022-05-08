const correlator = require('express-correlation-id')
const requestIP = require("request-ip");
const chalk = require("chalk")
const utils = require("@jshwilliams/node-utils")
const redis = require("../cache/redis")

const AUTHORIZED = ["http://localhost:3000"]

const logger = async function (req, res, next) {
    let ip = requestIP.getClientIp(req)
    let correlationID = correlator.getId()
    res.locals.correlation = correlationID
    res.locals.req_url = req.url
    res.header("CorrelationID", correlationID)
    
    utils.log.info(`${correlationID} ${chalk.cyan("ip")}=${ip} ${chalk.cyan("method")}=${req.method} ${chalk.cyan("api")}=${decodeURIComponent(req.url)}`)
    // if(req.headers["content-type"] !== "application/json"){ return res.status(415).json({"message": "Set content-type header to application/json to use deltaDB API"}) }

    if (req.method === "OPTIONS") {
        if (AUTHORIZED.indexOf(req.headers.origin) > -1) {
            res.header("Access-Control-Allow-Origin", req.headers.origin)
            res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            res.send(200)
        }
    }

    let data = await redis.getCache(res.locals.req_url)

    if(data){
        return res.status(200).json(JSON.parse(data))
    }else{
        next()
    }
    
}

module.exports = {logger}