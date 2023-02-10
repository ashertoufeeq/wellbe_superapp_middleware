const Screening = require("../../models/campScreening.model");
const Analytics = require("../../models/analytics.model");
const Patient = require("../../models/patientRecord");
const Camp = require("../../models/camps.model");
const Program = require("../../models/program.model");
const LabItem = require("../../models/labItem");
const Eod = require("../../models/eod.model");
const { screeningForUpdate, labForUpdate, eodForUpdate } = require("./helper");
const util = require("util");

const processLab = () =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let moved_actions_ids = [];
    console.log("Processing Lab --");
    const labCursor = await LabItem.find({}).cursor();

    for (
      let action = await labCursor.next();
      action != null;
      action = await labCursor.next()
    ) {
      const actions_json = action.toJSON();
      action.packages = (actions_json.packages || []).map((p) => {
        return {
          ...p,
          activities: (p.activities || []).slice(0, 2),
        };
      });
      process.stdout.write(".");
      await action.save();
      process.stdout.write(".");
    }

    console.log("lab done");
    resolve();
  });

module.exports = async () => {
  await processLab();
};
