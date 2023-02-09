const Screening = require("../../models/campScreening.model");
const Analytics = require("../../models/analytics.model");
const Patient = require("../../models/patientRecord");
const Camp = require("../../models/camps.model");
const Program = require("../../models/program.model");
const LabItem = require("../../models/labItem");
const { screeningForUpdate, labForUpdate } = require("./helper");
const util = require("util");

const processScreening = () =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let screenings = [];
    let screeningCount = 0;
    let moved_actions_ids = [];
    console.log("Processing Screenings --");
    const screeningCursor = await Screening.find({})
      .populate([
        {
          path: "patientId",
          select:
            "fName lName gender dob _id createdAt updatedAt createdBy updatedBy consolidatedReportUrl consolidatedReportGeneratedAt uhid villagePinCode",
        },
        {
          path: "campId",
          select: "name villageName villagePinCode talukaName programId _id",
          populate: {
            path: "programId",
            select: "programShortCode programNumber",
          },
        },
      ])
      .cursor();

    for (
      let action = await screeningCursor.next();
      action != null;
      action = await screeningCursor.next()
    ) {
      let actions_json = action.toJSON();
      moved_actions_ids.push(actions_json.patientId._id);
      screeningCount++;
      process.stdout.write(".");

      let update = screeningForUpdate({
        screening: actions_json,
        existingUpdate: processedPatientMap[actions_json.patientId._id] || {},
      });
      if (processedPatientMap[actions_json.patientId._id]) {
        moved_actions = moved_actions.map((a) => {
          if (
            a.updateOne.update.$setOnInsert["Patient Id"].equals(
              actions_json.patientId._id
            )
          ) {
            return update;
          }
          return a;
        });
      } else {
        moved_actions.push(update);
      }

      processedPatientMap[actions_json.patientId._id] = update;

      // Every 100, stop and wait for them to be done
      if (moved_actions.length > 10) {
        await Analytics.bulkWrite(moved_actions);

        count = count + moved_actions.length;
        process.stdout.write(".");

        moved_actions = [];
      }
    }
    if (moved_actions.length > 0) {
      await Analytics.bulkWrite(moved_actions);

      count = count + moved_actions.length;
      process.stdout.write(".");
    }
    console.log("Screenings done");
    processedPatientMap = {};
    resolve();
  });

const processLab = () =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let moved_actions_ids = [];
    console.log("Processing Lab --");
    const labCursor = await LabItem.find({
      packages: {
        $not: { $elemMatch: { reportUrl: { $exists: false }, cleared: false } },
      },
    }).cursor();

    for (
      let action = await labCursor.next();
      action != null;
      action = await labCursor.next()
    ) {
      let actions_json = action.toJSON();
      moved_actions_ids.push(actions_json.patientId);
      process.stdout.write(".");

      let update = labForUpdate({
        lab: actions_json,
        existingUpdate: processedPatientMap[actions_json.patientId] || {},
      });
      if (processedPatientMap[actions_json.patientId]) {
        moved_actions = moved_actions.map((a) => {
          if (
            a.updateOne.update.$setOnInsert["Patient Id"].equals(
              actions_json.patientId
            )
          ) {
            return update;
          }
          return a;
        });
      } else {
        moved_actions.push(update);
      }

      processedPatientMap[actions_json.patientId] = update;

      // Every 100, stop and wait for them to be done
      if (moved_actions.length > 10) {
        await Analytics.bulkWrite(moved_actions);

        count = count + moved_actions.length;
        process.stdout.write(".");

        moved_actions = [];
      }
    }
    if (moved_actions.length > 0) {
      await Analytics.bulkWrite(moved_actions);

      count = count + moved_actions.length;
      process.stdout.write(".");
    }
    console.log("lab done");
    resolve();
  });

module.exports = async () => {
  await processScreening();
  await processLab();
};
