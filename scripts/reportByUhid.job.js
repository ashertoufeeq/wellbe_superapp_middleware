const _ = require("lodash");
const mongoose = require("mongoose");
const data = require("./uhids.json");
const Patients = require("../models/patientRecord");
const generateConsolidatedReport = require("../jobs/generateConsolidatedReport.job");

const batchRunner = async ({ batch, batchIndex }) => {
  console.log(`index${[batchIndex]}`);
  let i = 0;
  for (const item of batch) {
    const patient = await Patients.findOne({uhid: item}, { 'uhid': 1, '_id': 1, 'consolidatedReportUrl': 1 });
    
    const d = await generateConsolidatedReport({body: {
      patientId: patient?._id,
      regenerate: patient?.consolidatedReportUrl 
    }});

    console.log(d,'data')
    i = i + 1;  
  }
};

console.log("running ->", data.length);
const batches = _.chunk(data, 20000);
const main = async () => {

  await Promise.all(
    (batches).map((batch, index) =>
      batchRunner({
        batch,
        batchIndex: index,
      })
    )
  );

  console.log("All Done");
};

module.exports = async () => {
  await main();
  console.log("All Done");
};
