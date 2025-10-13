const express = require('express');
const router = express.Router();
const { createTaxData, getAllTaxData } = require("../models/controllerrs");
// Destructure the function from the controller
const { uploadFileAndCalculate } = require('../controllers/taxController');
const { generateXML } = require("../controllers/taxController");

router.get("/generate-xml/:id", generateXML);


router.post("/calculate-tax", uploadFileAndCalculate);

router.post("/taxdata", createTaxData);


router.get("/taxdata", getAllTaxData);

module.exports = router;
