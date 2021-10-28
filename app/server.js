const express = require("express");
const app = express();

const correlator = require('express-correlation-id')
const requestIP = require("request-ip");
const log = require("loglevel")
const cors = require("cors");

const swagger = require("./swagger/swagger")
const utility = require("./utility/utility")
const routes = require("./routes/routes")

const port = process.env.PORT || 5000

swagger(app)

app.use(express.json())
app.use(cors())
app.use(correlator())

const AUTHORIZED = ["http://localhost:3000"]

app.use(function (req, res, next) {
    if (req.method === "OPTIONS") {
        if (AUTHORIZED.indexOf(req.headers.origin) > -1) {
            res.header("Access-Control-Allow-Origin", req.headers.origin)
            res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            res.send(200)
        }
    } else {
        let date = new Date().toISOString()
        let ip = requestIP.getClientIp(req)
        let correlationID = correlator.getId()
        res.locals.correlation = correlationID
        console.log(`[ ${date} ] [ ${correlationID} ] [ ${ip} ] [ ${req.method} ] ${req.url}`)
        res.header("CorrelationID", correlationID)
        // if(req.headers["content-type"] !== "application/json"){ return res.status(415).json({"message": "Set content-type header to application/json to use deltaDB API"}) }
        next()
    }
})

app.use("/api", routes)

app.listen(port, async () => {
    console.log(`NFL DB API running on port: ${port}`)
    // let db = await utility.neo4j.verifyConnection(driver)
    // console.log(`${db.message}: ${db.status}`)
})