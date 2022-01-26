const correlator = require('express-correlation-id')
const requestIP = require("request-ip");

const AUTHORIZED = ["http://localhost:3000"]

const logger = function (req, res, next) {
    let date = new Date().toISOString()
    let ip = requestIP.getClientIp(req)
    let correlationID = correlator.getId()
    res.locals.correlation = correlationID
    res.header("CorrelationID", correlationID)
    console.log(`[ ${date} ] [ ${correlationID} ] [ ${ip} ] [ ${req.method} ] ${decodeURIComponent(req.url)}`)
    // if(req.headers["content-type"] !== "application/json"){ return res.status(415).json({"message": "Set content-type header to application/json to use deltaDB API"}) }

    if (req.method === "OPTIONS") {
        if (AUTHORIZED.indexOf(req.headers.origin) > -1) {
            res.header("Access-Control-Allow-Origin", req.headers.origin)
            res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            res.send(200)
        }
    }
    next()
}

module.exports = {logger}