const express = require("express")
const router = express.Router()

const admin = require('./admin/admin')

router.route("/").get(function (req,res) {
    res.json({message: "Welcome to the deltaDB API!"})
})

router.use("/v2/admin", admin)
router.use("/v2/static", express.static(`${__dirname}/../static`))

module.exports = router