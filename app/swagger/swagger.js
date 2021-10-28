const swaggerUI = require("swagger-ui-express")
const swaggerYAML = require("./swagger.json")

const docs = (app) => {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerYAML))
}

module.exports = docs