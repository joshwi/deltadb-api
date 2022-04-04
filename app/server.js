const express = require("express");
const app = express();

const correlator = require('express-correlation-id')
// const log = require("loglevel")
const cors = require("cors");

const swagger = require("./swagger/swagger")
const routes = require("./routes/routes")
const {logger} = require("./utility/middleware/middleware")
const utils = require("@jshwilliams/node-utils")
const chalk = require("chalk")

const port = process.env.PORT || 5000

swagger(app)

app.use(express.json())
app.use(cors())
app.use(correlator())

app.use(logger)
  

app.route("/").get(function (req,res) {
    res.json({message: "Welcome to the deltaDB API!"})
})

app.use("/api", routes)

app.listen(port, async () => {
    utils.log.info(`${chalk.cyan("port")}=${port} ${chalk.cyan("message")}=NFL DB API Started`)
})