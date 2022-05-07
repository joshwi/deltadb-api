const express = require("express")
const router = express.Router()

const admin = require('./admin/admin')
const node = require('./node')

router.use("/v2/admin", admin)
router.use("/v2/node", node)
router.use("/v2/static", express.static(`${__dirname}/../static`))

module.exports = router