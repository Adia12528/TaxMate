// taxCalculator.js

/**
 * Calculates income tax for Indian tax system
 * @param {number} income - Gross salary
 * @param {string} regime - "old" or "new"
 * @returns {number} tax amount
 */
function calculateTax(income, regime = "old") {
  let tax = 0;

  if (regime === "old") {
    // Old regime slabs FY 2025-26
    if (income <= 250000) tax = 0;
    else if (income <= 500000) tax = (income - 250000) * 0.05;
    else if (income <= 1000000) tax = 12500 + (income - 500000) * 0.2;
    else tax = 112500 + (income - 1000000) * 0.3;
  } else if (regime === "new") {
    // New regime slabs FY 2025-26
    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = (income - 300000) * 0.05;
    else if (income <= 900000) tax = 15000 + (income - 600000) * 0.1;
    else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
    else tax = 90000 + (income - 1200000) * 0.2;
  }

  return Math.round(tax); // rounded to nearest integer
}

module.exports = calculateTax;
