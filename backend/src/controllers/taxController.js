// src/controllers/taxController.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const calculateTax = require("../utils/taxCalculator");
const jsonToXML = require("../utils/jsonToXML");
const { TaxData } = require("../models/controllerrs");
const parseTaxText = require("../utils/parseTaxText");
const mongoose = require('mongoose');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

function fileFilter(req, file, cb) {
  // Accept images and PDFs
  if (!file.mimetype.startsWith("image/") && file.mimetype !== "application/pdf") {
    return cb(new Error("Only image or PDF files are allowed!"), false);
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter }).fields([
  { name: "documents", maxCount: 5 },
  { name: "document", maxCount: 1 },
]);

// Helper: Extract all large numbers from text
function extractNumbers(text) {
  if (!text) return [];
  return text
    .match(/[\d,]+(?:\.\d+)?/g) // match numbers with commas/decimals
    ?.map(n => parseFloat(n.replace(/[, ]/g, "")))
    .filter(n => !isNaN(n) && n >= 1000) || []; // ignore small numbers (noise)
}

// Upload & OCR/PDF processing
exports.uploadFileAndCalculate = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: err.message || "File upload failed" });
    }

    console.log("Received file fields:", Object.keys(req.files || {}));

    const files = []
      .concat(req.files?.documents || [])
      .concat(req.files?.document || []);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file uploaded. Use 'documents' or 'document' as key." });
    }

    try {
      let totalSalary = 0;
      let totalTDS = 0;

      const parsedFiles = [];
      for (const file of files) {
        let text = "";

        if (file.mimetype === "application/pdf") {
          // PDF parsing
          const dataBuffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(dataBuffer);
          text = pdfData.text;
        } else {
          // Image OCR
          const { data: { text: ocrText } } = await Tesseract.recognize(file.path, "eng");
          text = ocrText;
        }

        console.log("Extracted Text:\n", text);

  // parse structured values from the OCR text
  const parsed = parseTaxText(text);
  console.log("Parsed result for file:", parsed);
  parsedFiles.push(parsed);

        // prefer totals from parser when available
        if (parsed && (parsed.total_amount_paid || parsed.total_tax_deducted)) {
          totalSalary += parsed.total_amount_paid || 0;
          totalTDS += parsed.total_tax_deducted || 0;
        } else {
          // fallback: extract large numbers (ignore small noise)
          const numbers = extractNumbers(text);
          numbers.sort((a, b) => b - a); // descending
          console.log("Fallback numbers from text:", numbers);
          totalSalary += numbers[0] || 0;
          totalTDS += numbers[1] || 0;
        }
      }

      const oldTax = calculateTax(totalSalary, "old");
      const newTax = calculateTax(totalSalary, "new");
      const better = oldTax < newTax ? "Old Regime" : "New Regime";

      // Save extracted data to MongoDB (store parsedFiles summary too)
      const taxData = new TaxData({
        fullName: parsedFiles[0]?.employee || "From OCR/PDF",
        age: 30,
        residentialStatus: "Resident",
        taxRegime: better === "Old Regime" ? "Old" : "New",
        income: { salary: { basic: totalSalary, hra: 0, otherAllowances: 0, bonus: 0 } },
        deductions: {},
        prepaidTaxes: { tdsAlreadyDeducted: totalTDS, advanceTaxPaid: 0 },
        parsedFiles: parsedFiles,
      });

      await taxData.save();

      // Also generate XML and return it in the response so the client can download immediately
      let xml = null;
      try {
        xml = jsonToXML(taxData.toObject());
      } catch (e) {
        console.warn("Failed to generate XML for saved TaxData:", e.message);
      }

      res.json({
        message: "OCR/PDF data saved successfully",
        id: taxData._id,
        salary: totalSalary,
        tds: totalTDS,
        old_regime_tax: oldTax,
        new_regime_tax: newTax,
        best_option: better,
        parsed: parsedFiles,
        xml,
      });

    } catch (error) {
      console.error("PDF/OCR/Tax calculation error:", error);
      res.status(500).json({ error: "PDF parsing or tax calculation failed" });
    }
  });
};

// Generate XML from saved TaxData
exports.generateXML = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Generating XML for ID:", userId);

    // Validate ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn("Invalid ObjectId format:", userId);
      return res.status(400).json({ error: "Invalid id format" });
    }

    const taxData = await TaxData.findById(userId);
    if (!taxData) return res.status(404).json({ error: "Tax data not found" });

    console.log("TaxData found for id", userId);
    const xml = jsonToXML(taxData.toObject());
    res.set("Content-Type", "application/xml");
    return res.send(xml);
  } catch (error) {
    console.error("XML generation error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Standard CRUD for TaxData
exports.createTaxData = async (req, res) => {
  try {
    const newTaxData = new TaxData(req.body);
    await newTaxData.save();
    res.status(201).json({ message: "Tax data saved successfully", data: newTaxData });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTaxData = async (req, res) => {
  try {
    const data = await TaxData.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

