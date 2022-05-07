const swaggerUI = require("swagger-ui-express")
const tags = require("./assets/tags.json")
const inputs = require("./assets/inputs.json")
const schemas = require("./assets/schemas.json")
require("dotenv").config()

const DELTADB_HOST = process.env.DELTADB_HOST
const DELTADB_SERVICE_PORT = process.env.DELTADB_SERVICE_PORT

const doc = {
    "openapi": "3.0.0",
    "info": {
        "title": "deltaDB API",
        "version": "1.0.0",
        "description": "REST API built for deltaDB services",
        "license": {
            "name": "MIT",
            "url": "https://mit-license.org/"
        }
    },
    "servers": [
        {
            "url": `https://www.${DELTADB_HOST}:${DELTADB_SERVICE_PORT}/api/v2`
        }
    ],
    "tags": [
        tags.node,
        tags.cache,
        tags.admin
    ],
    "paths": {
        "/admin/cache/{correlationID}": {
            "get": {
                "tags": [
                    "Cache"
                ],
                "summary": "Check Correlation ID Status",
                "description": "Check cached status of the correlation ID for an API request",
                "parameters": [
                    inputs.correlationID
                ],
                "responses": schemas.generic_ok
            }
        },
        "/admin/db/status": {
            "get": {
                "tags": [
                    "Admin"
                ],
                "summary": "Returns connection status of graph DB",
                "responses": schemas.generic_ok
            }
        },
        "/admin/db/cypher": {
            "post": {
                "tags": [
                    "Admin"
                ],
                "summary": "Run cypher query to graph DB",
                "requestBody": schemas.cypher_body,
                "responses": {
                    "200": schemas.cypher_ok,
                    "400": schemas.cypher_bad
                }
            }
        },        
        "/admin/db/transactions/{folder}/{category}/{file}": {
            "post": {
                "tags": [
                    "Admin"
                ],
                "summary": "Run transactions to Neo4j DB instance",
                "parameters": [
                    inputs.folder,
                    inputs.category,
                    inputs.file
                ],
                "responses": {
                    "200": schemas.transactions_ok,
                    "400": schemas.transactions_bad
                }
            }
        },
        "/node/{node}/{label}": {
            "get": {
                "tags": [
                    "Node"
                ],
                "summary": "Get instances of a node in Neo4j DB",
                "parameters": [
                    inputs.node_required,
                    inputs.label
                ],
                "responses": schemas.generic_ok
            },
            "post": {
                "tags": [
                    "Node"
                ],
                "summary": "Create new instance of a node in Neo4j DB",
                "parameters": [
                    inputs.node_required,
                    inputs.label_required
                ],
                "responses": schemas.generic_ok
            },
            "put": {
                "tags": [
                    "Node"
                ],
                "summary": "Update instance of a node in Neo4j DB",
                "parameters": [
                    inputs.node_required,
                    inputs.label_required
                ],
                "responses": schemas.generic_ok
            },
            "delete": {
                "tags": [
                    "Node"
                ],
                "summary": "Delete instance of a node in Neo4j DB",
                "parameters": [
                    inputs.node_required,
                    inputs.label_required
                ],
                "responses": schemas.generic_ok
            }
        }
    }
}

const docs = (app) => {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(doc, { customCss: '.swagger-ui .topbar { display: none }'}))
}

module.exports = docs