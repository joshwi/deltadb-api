const express = require("express");
const app = express();

const correlator = require('express-correlation-id')
const requestIP = require("request-ip");
const log = require("loglevel")
const cors = require("cors");

var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

const swagger = require("./swagger/swagger")
const routes = require("./routes/routes")

const port = process.env.PORT || 5000

swagger(app)

app.use(express.json())
app.use(cors())
app.use(correlator())

const AUTH0_JWT_URL= process.env.AUTH0_JWT_URL
const DELTADB_SERVICE_HOST = process.env.DELTADB_SERVICE_HOST
const DELTADB_SERVICE_PORT = process.env.DELTADB_SERVICE_PORT

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${AUTH0_JWT_URL}/.well-known/jwks.json`
  }),
  audience: `${DELTADB_SERVICE_HOST}:${DELTADB_SERVICE_PORT}`,
  issuer: `${AUTH0_JWT_URL}/`,
  algorithms: ['RS256']
});
    

const AUTHORIZED = ["http://localhost:3000"]

app.use(jwtCheck);

app.use(function (err, req, res, next) {
    let date = new Date().toISOString()
    let ip = requestIP.getClientIp(req)
    let correlationID = correlator.getId()
    res.locals.correlation = correlationID
    res.header("CorrelationID", correlationID)
    console.log(`[ ${date} ] [ ${correlationID} ] [ ${ip} ] [ ${req.method} ] ${req.url}`)
    // if(req.headers["content-type"] !== "application/json"){ return res.status(415).json({"message": "Set content-type header to application/json to use deltaDB API"}) }

    if(err.name === 'UnauthorizedError') {
        res.status(err.status).send({message: "Unauthorized Error", correlationID: res.locals.correlation, error: err.message});
        console.log(`[ ${date} ] [ ${correlationID} ] [ Message: Unauthorized Error ] [ Error: ${err.message} ]`)
        // console.log(err);
        return;
      }
    if (req.method === "OPTIONS") {
        if (AUTHORIZED.indexOf(req.headers.origin) > -1) {
            res.header("Access-Control-Allow-Origin", req.headers.origin)
            res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            res.send(200)
        }
    } else {
        next()
    }
})

app.route("/").get(function (req,res) {
    res.json({message: "Welcome to the deltaDB API!"})
})

app.use("/api", routes)

app.listen(port, async () => {
    console.log(`NFL DB API running on port: ${port}`)
})