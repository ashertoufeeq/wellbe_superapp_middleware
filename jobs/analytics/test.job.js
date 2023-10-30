const Screening = require("../../models/campScreening.model");
const AnalyticsCollection = require("../../models/analytics.model");
const { analyticsDb } = require("../../index");
const Patient = require("../../models/patientRecord");
const Camp = require("../../models/camps.model");
const Program = require("../../models/program.model");
const LabItem = require("../../models/labItem");
const Eod = require("../../models/eod.model");
const { screeningForUpdate, labForUpdate, eodForUpdate } = require("./helper");
const util = require("util");

let Analytics;
if (process.env.ANALYTICS_DB) {
  Analytics = analyticsDb.model(
    "custom_analytics_screenings",
    AnalyticsCollection.analyticsSchema
  );
} else {
  Analytics = AnalyticsCollection.analyticsModel;
}

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
          activities: (p.activities || []).slice(0, 2).map((a) => ({
            at: a.at,
            type: a.type,
            by: a.by,
            ...(a.reportUrl && { reportUrl: a.reportUrl }),
            ...(a.rejectionReason && { rejectionReason: a.rejectionReason }),
          })),
          ...(p.reportData && {
            reportData: {
              ...p.reportData,
              parameters: (p.reportData?.parameters || []).map((param) => ({
                name: param.name,
                ...(param.machineCode && { machineCode: param.machineCode }),
                value: param.value,
              })),
            },
          }),
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
