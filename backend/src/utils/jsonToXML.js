const { create } = require("xmlbuilder2");

function jsonToXML(taxData) {
  // Wrap data in a root element required by ITD-like XMLs
  const xmlObj = {
    ITR: {
      PersonalInfo: {
        FullName: taxData.fullName,
        Age: taxData.age,
        ResidentialStatus: taxData.residentialStatus,
        TaxRegime: taxData.taxRegime,
      },
      Income: taxData.income,
      Deductions: taxData.deductions,
      PrepaidTaxes: taxData.prepaidTaxes,
    },
  };

  const xml = create({ version: "1.0" })
    .ele(xmlObj)
    .end({ prettyPrint: true });

  return xml;
}

module.exports = jsonToXML;
