// src/utils/parseTaxText.js
// Lightweight parser for Form-16 / TDS certificate OCR text.

function toNumber(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.-]/g, "")) || 0;
}

function parseQuarters(text) {
  const quarters = [];
  // Match lines containing 'Quarter' followed by three monetary values
  const quarterRegex = /Quarter\s*\d+[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/ig;
  let m;
  while ((m = quarterRegex.exec(text))) {
    const amount = toNumber(m[1]);
    const taxDeducted = toNumber(m[2]);
    const taxDeposited = toNumber(m[3]);
    quarters.push({ amount_paid: amount, tax_deducted: taxDeducted, tax_deposited: taxDeposited });
  }
  return quarters;
}

function extractTotal(text) {
  // Try several Total patterns. Prefer lines containing the word 'Total' followed by two amounts
  const totalRegexes = [
    /Total[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
    /Total[^\n]*?Amount[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[^\n]*?Tax[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
  ];
  for (const rx of totalRegexes) {
    const m = text.match(rx);
    if (m) return { total_amount_paid: toNumber(m[1]), total_tax_deducted: toNumber(m[2]) };
  }
  return { total_amount_paid: 0, total_tax_deducted: 0 };
}

function extractPAN(text) {
  const panMatch = text.match(/([A-Z]{5}[0-9]{4}[A-Z])/i);
  return panMatch ? panMatch[1].toUpperCase() : null;
}

function extractAssessmentYear(text) {
  const ayMatch = text.match(/Assessment Year\s*[:\-]?\s*(\d{4}\s*-\s*\d{4})/i);
  if (ayMatch) return ayMatch[1].trim();
  // fallback: look for pattern like 2021 - 2022
  const fallback = text.match(/(20\d{2}\s*-\s*20\d{2})/);
  return fallback ? fallback[1] : null;
}

function extractPeriod(text) {
  const periodMatch = text.match(/From\s*(\d{1,2}[-\/]?[A-Za-z]{3,9}[-\/]?\d{2,4})\s*To\s*(\d{1,2}[-\/]?[A-Za-z]{3,9}[-\/]?\d{2,4})/i);
  if (periodMatch) return { from: periodMatch[1], to: periodMatch[2] };
  // fallback: try 'Period' line with two dates
  const periodMatch2 = text.match(/Period[\s\S]{0,40}?From[:\s]*([\d\-/A-Za-z]+)\s*To[:\s]*([\d\-/A-Za-z]+)/i);
  if (periodMatch2) return { from: periodMatch2[1], to: periodMatch2[2] };
  return null;
}

function extractNames(text) {
  let employer = null;
  let employee = null;
  const employerMatch = text.match(/Name and Address of the Employer[\s\S]{0,200}?\n([\s\S]*?)\nName and Designation of the Employee/i);
  if (employerMatch) {
    employer = employerMatch[1].replace(/\n/g, " ").trim();
  } else {
    // fallback: find a line before city or PAN
    const em = text.match(/Name and Address of the Employer\s*([\s\S]{0,120})/i);
    if (em) employer = em[1].split('\n')[0].trim();
  }

  const employeeMatch = text.match(/Name and Designation of the Employee\s*([\s\S]{0,60})/i);
  if (employeeMatch) employee = employeeMatch[1].split('\n')[0].trim();

  return { employer, employee };
}

module.exports = function parseTaxText(text) {
  if (!text || typeof text !== 'string') return {};
  const normalized = text.replace(/\r/g, "\n").replace(/\t/g, " ").replace(/\|/g, " ").replace(/\s+/g, " ");

  // Try to extract totals first
  const totals = extractTotal(normalized);

  // If totals not found, try to parse quarter rows and sum them
  let quarters = [];
  if ((!totals.total_amount_paid || !totals.total_tax_deducted) || (totals.total_amount_paid === 0 && totals.total_tax_deducted === 0)) {
    quarters = parseQuarters(text);
    if (quarters && quarters.length > 0) {
      const sumAmount = quarters.reduce((s, q) => s + (q.amount_paid || 0), 0);
      const sumTax = quarters.reduce((s, q) => s + (q.tax_deducted || 0), 0);
      totals.total_amount_paid = sumAmount;
      totals.total_tax_deducted = sumTax;
    }
  } else {
    // if totals exist, still try to detect quarters
    quarters = parseQuarters(text);
  }

  // Fallback: if totals are still zero, pick large numbers from text (ignore < 1000)
  if ((!totals.total_amount_paid || !totals.total_tax_deducted) || (totals.total_amount_paid === 0 && totals.total_tax_deducted === 0)) {
    const nums = (text.match(/[\d,]+(?:\.\d+)?/g) || []).map(s => parseFloat(s.replace(/,/g, ''))).filter(n => !isNaN(n) && n >= 1000).sort((a, b) => b - a);
    totals.total_amount_paid = nums[0] || 0;
    totals.total_tax_deducted = nums[1] || 0;
  }

  const pan = extractPAN(text);
  const ay = extractAssessmentYear(text);
  const period = extractPeriod(text);
  const names = extractNames(text);

  return {
    employer: names.employer || null,
    employee: names.employee || null,
    pan_of_deductor: pan || null,
    assessment_year: ay || null,
    period: period || null,
    quarters: quarters || [],
    total_amount_paid: totals.total_amount_paid || 0,
    total_tax_deducted: totals.total_tax_deducted || 0,
  };
};
