// controllers.js
const mongoose = require("mongoose");

// Define the schema for tax data
const taxSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  residentialStatus: { type: String, enum: ["Resident", "NRI", "RNOR"], required: true },
  taxRegime: { type: String, enum: ["Old", "New"], required: true },

  income: {
    salary: {
      basic: Number,
      hra: Number,
      otherAllowances: Number,
      bonus: Number,
    },
    houseProperty: {
      rentalIncome: Number,
      interestOnHomeLoan: Number,
      propertyType: { type: String, enum: ["Self-occupied", "Let-out"] },
    },
    businessIncome: {
      netProfit: Number,
    },
    capitalGains: {
      shortTerm: Number,
      longTerm: Number,
    },
    otherIncome: {
      bankInterest: Number,
      dividends: Number,
      lotteryWinnings: Number,
      anyOther: Number,
    },
  },

  deductions: {
    section80C: Number,
    section80D: Number,
    section80E: Number,
    section24b: Number,
    hraExemption: Number,
    standardDeduction: Number,
    otherDeductions: Number,
  },

  prepaidTaxes: {
    tdsAlreadyDeducted: Number,
    advanceTaxPaid: Number,
  },
});

const TaxData = mongoose.model("TaxData", taxSchema);

// Controller functions

// Create new tax data
const createTaxData = async (req, res) => {
  try {
    const newTaxData = new TaxData(req.body);
    await newTaxData.save();
    res.status(201).json({ message: "Tax data saved successfully", data: newTaxData });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all tax data
const getAllTaxData = async (req, res) => {
  try {
    const data = await TaxData.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




module.exports = { createTaxData, getAllTaxData, TaxData };
