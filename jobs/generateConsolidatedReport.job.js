const axios = require("axios");
const moment = require("moment");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const sendMessageBird = require("../utils/message");

const ScreeningModel = require("../models/campScreening.model");
const Patient = require("../models/patientRecord");
const labItemModel = require("../models/labItem");
const { getEjsFile } = require("../utils/upload");
const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const {
  tranformerConsolidatedReportData,
  reportGenerationStatus
} = require("../utils/consolidatedReport");
const campsModel = require("../models/camps.model");
const mergeByUrl = require("../scripts/merge");
const ObjectId = require("mongoose").Types.ObjectId;

const renderHTML = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);
const timezone = "Asia/Kolkata";

const render = ejs.compile(renderHTML);

const sendToMe = false;

module.exports = async (req, res) => {
  console.log("Consolidated Report Fetching");

  try {
    let skippedUhid = {};
    let labItemsMap = {};
    let detailsMap = {};
    const patientIds = [];
    let uhidMap = {};

    const labs = await labItemModel.aggregate([
      {
        $match: {
          packages: {
            $not: {
              $elemMatch: { reportUrl: { $exists: false }, cleared: false },
            },
          },
          ...(!req
            ? {
                isProcessed: {
                  $ne: true,
                },
              }
            : {}),
          ...(req && req?.body.patientId
            ? {
                patientId: ObjectId(req?.body.patientId),
              }
            : {}),
        },
      },
      {
        $lookup: {
          from: "patient_records",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          package: { $first: "$packages" },
          patientUhid: "$patient.uhid",
          patientId: "$patient._id",
          isReportSent: "$patient.isReportSent",
        },
      },
      {
        $addFields: {
          reportUrl: "$package.reportUrl",
        },
      },
      {
        $project: {
          reportUrl: "$reportUrl",
          uhid: "$patientUhid",
          patientId: "$patientId",
          isReportSent: "$isReportSent",
        },
      },
    ]);

    console.log(
      labs.length,
      labs.filter((i) => i.reportUrl).length,
      "labs length"
    );

    if ((labs || []).length > 0) {
      for (const item of labs) {
        const uhid = item?.uhid;
        if (item?.reportUrl) {
          if (!(patientIds || []).includes(item?.patientId)) {
            patientIds.push(item?.patientId);
          }
          labItemsMap = {
            ...labItemsMap,
            [uhid]: [...(labItemsMap[uhid] || []), item],
          };
        }
      }
    }

    const screenings = await ScreeningModel.find({
      patientId: { $in: patientIds },
    })
      .populate([{ path: "patientId" }, { path: "campId" }])
      .sort({ createdAt: "asc" })
      .exec();

    console.log(screenings.length, "screenings");

    if (screenings) {
      for (const screening of screenings) {
        const uhid = screening?.patientId?.uhid;
        const campId = screening.campId?._id;
        detailsMap = {
          ...detailsMap,
          [campId]: {
            ...(detailsMap[campId] || {}),
            [uhid]: {
              ...(detailsMap[campId] ? detailsMap[campId][uhid] : {}),
              campId: screening?.campId,
              state: screening?.campId?.stateName,
              district: screening?.campId?.villageName,
              location: `${screening?.campId?.talukaName},${screening?.campId?.villageName}(${screening?.campId?.villagePinCode})`,
              patient: screening?.patientId,
              screeningDate: screening?.createdAt,
              screenings: [
                ...((detailsMap[campId] ? detailsMap[campId][uhid] : {})
                  ?.screenings || []),
                ...(screening?.campId?._id === campId ? [screening] : []),
              ],
              labItems: labItemsMap[uhid],
            },
          },
        };
      }
    }

    const campIdArray = Object.keys(detailsMap);
    let campCounter = 1;
    let globalCount = 1;

    if(campIdArray.length === 0){
      if (req?.body && res) {          
          await Patient.findByIdAndUpdate(
            req?.body.patientId,
            {
              consolidatedReportStatus: reportGenerationStatus.labReportPending
            },
            { new: true }
          );
          res.status(500).json(reportGenerationStatus.labReportPending);
      }
    }

    for (const campId of campIdArray) {
      console.log("Camp Count: ", campCounter, campIdArray.length);
      const uhidArray = Object.keys(detailsMap[campId]);
      let pdfLinks = [];
      let interation = 1;

      for (const uhid of uhidArray) {
        console.log(globalCount, labs.length);
        const details = detailsMap[campId][uhid];
        if (((details || {}).screenings || []).length > 3) {
          if (
            details?.patient?.consolidatedReportUrl &&
            (!req || (req && (!req?.body.regenerate)))
          ) {
            console.log("Report already generated for :", uhid);
            uhidMap = {
              ...uhidMap,
              [uhid]: details?.patient?.consolidatedReportUrl,
            };
          } else {
            let labReportGenerated = false;
            let screeningReportGenerated = false;
            let results = {};

            ((details || {}).screenings || []).map((screening) => {
              if (screening.formsDetails) {
                (screening.formsDetails || []).map((item) => {
                  results = { ...results, ...(item.results || {}) };
                });
              }
            });

            const buffer = await getEjsFile({
              render,
              data: tranformerConsolidatedReportData({
                patient: details?.patient,
                resultsObject: results,
                screeningDate: details?.screeningDate,
                location: details?.campId?.name,
                district: details.district,
                state: details.state,
              }),
              fileName: "consolidated-report" + Date.now(),
            });
            pdfLinks.push(buffer);
            screeningReportGenerated = !!buffer;
            console.log(details.labItems, "lab items");
            for (const lab of details.labItems || []) {
              if (lab && lab?.reportUrl) {
                const labBuffer = await getFileBufferFromUrl(lab?.reportUrl);
                pdfLinks.push(labBuffer);
                labReportGenerated = true;
              }
            }

            console.log({ labReportGenerated, screeningReportGenerated });

            if (labReportGenerated && screeningReportGenerated) {
              const camp = await campsModel.findOne({
                _id: details?.campId._id,
              });
              console.log({
                previousReportUrl: camp?.reportUrl,
                _id: camp?._id,
              });
              const globalReportBuffer = camp?.reportUrl
                ? await getFileBufferFromUrl(camp?.reportUrl)
                : undefined;
              console.log("global buffer", !!globalReportBuffer, camp?.reportUrl);
              const { mergedUrl, error: mergeError } = await pdfMerge({
                pdfLinks,
              });

              const { mergedUrl: globalReportUrl, error: globalMergeError } =
                camp?.reportUrl
                  ? await pdfMerge({
                      pdfLinks: [globalReportBuffer, ...pdfLinks],
                    })
                  : { mergedUrl: null, error: null };

              console.log(globalReportUrl, "global", globalMergeError);
              if (mergeError) {
                console.log(mergeError);
                continue;
              } else {
                const patient = await Patient.findByIdAndUpdate(
                  details?.patient?._id,
                  {
                  ...((!req || (req && !req?.body.regenerate)) ? { consolidatedReportStatus: reportGenerationStatus.reportSent}:{}),
                    consolidatedReportUrl: mergedUrl,
                    consolidatedReportCampId: details?.campId?._id,
                    consolidatedReportGeneratedAt: moment()
                      .tz(timezone)
                      .toISOString(),
                  },
                  { new: true }
                );

                if (!req || (req && !req?.body.regenerate)) {
                  console.log("updating camp");

                  const campUpdated = await campsModel.findByIdAndUpdate(
                    details?.campId?._id,
                    {
                      $set: {
                        reportUrl: globalReportUrl
                          ? globalReportUrl
                          : mergedUrl,
                      },
                      $inc: {
                        numberOfConsolidatedReportGenerated: 1,
                      },
                      reportGeneratedAt: moment()
                      .tz(timezone)
                      .toISOString(),
                    },
                    { new: true }
                  );

                  console.log(campUpdated.reportUrl, details?.campId?._id);

                  const updatedLab = await labItemModel.updateMany(
                    {
                      _id: {
                        $in: (details.labItems || []).map((item) => item?._id),
                      },
                    },
                    {
                      $set: {
                        isProcessed: true,
                      },
                    }
                  );

                  const res = await sendMessageBird({
                    toMultiple: false,
                    to: details?.patient?.mobile,
                    media: { url: mergedUrl },
                    smsParameters: [mergedUrl],
                    templateId: "healthreport",
                  });

                  const res2 = await sendMessageBird({
                    toMultiple: false,
                    to: details?.patient?.mobile,
                    media: { url: mergedUrl },
                    languageCode: "kn",
                    smsParameters: [mergedUrl],
                    templateId: "healthreportkannada",
                  });
                }

                uhidMap = { ...uhidMap, [uhid]: mergedUrl };

                console.log({
                  uhidMap,
                  mergedUrl,
                  interation,
                  globalReportUrl,
                  uhidLength: uhidArray.length,
                  campId: details?.campId?._id,
                });

                interation = interation + 1;
                globalCount = globalCount + 1;
              }
            } else {
              pdfLinks = [];
              await Patient.findByIdAndUpdate(
                  details?.patient?._id,
                  { 
                    consolidatedReportStatus: !labReportGenerated? reportGenerationStatus.labReportPending: reportGenerationStatus.missingScreenings
                  },
                  { new: true }
              )
            }
          }
        } else {
          console.log(
            "Skipping because number of screening less than 4",
            details?.campId?._id,
            uhid
          );
          // await Patient.findByIdAndUpdate(
          //         details?.patient?._id,
          //         {
          //           consolidatedReportStatus: reportGenerationStatus.missingScreenings
          //         },
          //         { new: true }
          //   );
          skippedUhid = { ...skippedUhid, [uhid]: details?.campId?._id };
        }
        pdfLinks = [];
      }

      if (campCounter === campIdArray.length) {
        console.log("last iterations");
        if(sendToMe){
          await mergeByUrl(Object.values(uhidMap));
        }
        const uhidMapLen = Object.values(uhidMap).length;
        console.log("-------------------------", uhidMapLen);
        if (req?.body && res) {
          if (uhidMapLen > 0) {
            res.status(200).json(uhidMap);
          } else {
            res.status(500).json("Report not generated");
          }
        }
      }
      campCounter = campCounter + 1;
    }
  } catch (e) {
    console.log(e);
  }
};
