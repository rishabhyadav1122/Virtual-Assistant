const express = require('express');
const router = express.Router();
const {executeIntent} = require("../controllers/commandController")

router.post("/getResponse", executeIntent);

module.exports = router
