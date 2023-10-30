const Screening = require("../../models/campScreening.model");
const AnalyticsCollection = require("../../models/analytics.model");
const analyticsDb = require("../../index");
const Patient = require("../../models/patientRecord");
const Camp = require("../../models/camps.model");
const Program = require("../../models/program.model");
const LabItem = require("../../models/labItem");
const Eod = require("../../models/eod.model");
const Bill = require("../../models/bill.model");
const {
  screeningForUpdate,
  labForUpdate,
  eodForUpdate,
  patientForUpdate,
} = require("./helper");
const util = require("util");
const moment = require("moment");

let Analytics;
if (process.env.ANALYTICS_DB) {
  Analytics = analyticsDb.model(
    "custom_analytics_screenings",
    AnalyticsCollection.analyticsSchema
  );
} else {
  Analytics = AnalyticsCollection.analyticsModel;
}

const last15Minutes = moment().subtract(10, "minutes").toDate();
const lastDay = moment().subtract(1, "day").startOf("day").toDate();

exports.processScreening = (isEod) =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let screenings = [];
    let screeningCount = 0;
    let moved_actions_ids = [];
    console.log("Processing Screenings --");
    const screeningCursor = Screening.aggregate(
      [
        {
          $match: {
            $or: [
              {
                createdAt: {
                  $gte: isEod ? lastDay : last15Minutes,
                },
              },
              {
                updatedAt: {
                  $gte: isEod ? lastDay : last15Minutes,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            patient: {
              $toObjectId: "$patientId",
            },
            camp: {
              $toObjectId: "$campId",
            },
          },
        },
        {
          $lookup: {
            from: "patient_records",
            localField: "patient",
            foreignField: "_id",
            as: "patient",
          },
        },
        {
          $unwind: {
            path: "$patient",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "camps",
            localField: "camp",
            foreignField: "_id",
            as: "camp",
          },
        },
        {
          $unwind: {
            path: "$camp",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: "$patientId",
            screenings: {
              $push: "$$ROOT",
            },
          },
        },
      ],
      { allowDiskUse: true }
    ).cursor();

    for (
      let action = await screeningCursor.next();
      action != null;
      action = await screeningCursor.next()
    ) {
      process.stdout.write(".");

      let update = screeningForUpdate({
        group: action,
      });

      moved_actions.push(update);

      // processedPatientMap[
      //   actions_json.patientId._id + actions_json.campId._id
      // ] = update;

      // Every 100, stop and wait for them to be done
      if (moved_actions.length > 300) {
        await Analytics.bulkWrite(moved_actions);
        process.stdout.write(".");

        moved_actions = [];
      }
    }
    if (moved_actions.length > 0) {
      await Analytics.bulkWrite(moved_actions);

      process.stdout.write(".");
    }
    console.log("Screenings done");
    processedPatientMap = {};
    resolve();
  });

exports.processLab = (isEod) =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let moved_actions_ids = [];
    console.log("Processing Lab --");
    const labCursor = await LabItem.find({
      $or: [
        { createdAt: { $gte: isEod ? lastDay : last15Minutes } },
        { updatedAt: { $gte: isEod ? lastDay : last15Minutes } },
        { "packages.activities.at": { $gte: isEod ? lastDay : last15Minutes } },
      ],
    })
      .populate("billId", "billNumber")
      .cursor();

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
      if (moved_actions.length > 300) {
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

exports.processEod = (isEod) =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let moved_actions_ids = [];
    console.log("Processing Eod --");
    const eodCursor = await Eod.find({
      $or: [
        { createdAt: { $gte: isEod ? lastDay : last15Minutes } },
        { updatedAt: { $gte: isEod ? lastDay : last15Minutes } },
      ],
    }).cursor();

    for (
      let action = await eodCursor.next();
      action != null;
      action = await eodCursor.next()
    ) {
      let actions_json = action.toJSON();
      process.stdout.write(".");

      // Every 100, stop and wait for them to be done
      for (let patient of actions_json.patients) {
        let update = eodForUpdate({
          patient: { ...patient, campId: actions_json.campId },
          existingUpdate: processedPatientMap[patient.patientId] || {},
        });
        if (processedPatientMap[patient.patientId]) {
          moved_actions = moved_actions.map((a) => {
            if (
              a.updateOne.update.$setOnInsert["Patient Id"].equals(
                patient.patientId
              )
            ) {
              return update;
            }
            return a;
          });
        } else {
          moved_actions.push(update);
        }

        processedPatientMap[patient.patientId] = update;
      }
      if (moved_actions.length > 300) {
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
    console.log("Eod done");
    processedPatientMap = {};
    resolve();
  });

exports.processPatients = (isEod) =>
  new Promise(async (resolve, reject) => {
    let moved_actions = [];
    let count = 0;
    let processedPatientMap = {};
    let moved_actions_ids = [];
    console.log("Processing Patients --");
    const patientCursor = await Patient.find({
      $or: [
        { createdAt: { $gte: isEod ? lastDay : last15Minutes } },
        { updatedAt: { $gte: isEod ? lastDay : last15Minutes } },
      ],
    }).cursor();

    for (
      let action = await patientCursor.next();
      action != null;
      action = await patientCursor.next()
    ) {
      let actions_json = action.toJSON();
      process.stdout.write(".");

      let update = patientForUpdate({
        patient: actions_json,
      });

      moved_actions.push(update);

      // Every 100, stop and wait for them to be done

      if (moved_actions.length > 300) {
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
    console.log("Patients done");
    processedPatientMap = {};
    resolve();
  });

exports.processAll = async () => {
  await this.processScreening(true);
  await this.processLab(true);
  await this.processEod(true);
  await this.processPatients(true);
};
