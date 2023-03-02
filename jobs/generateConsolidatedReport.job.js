const axios = require("axios");
const moment = require("moment");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const ScreeningModel = require("../models/campScreening.model");
const Patient = require("../models/patientRecord");
const labItemModel = require("../models/labItem");
const { getEjsFile } = require("../utils/upload");
const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const {
  tranformerConsolidatedReportData,
  reportGenerationStatus,
  getResults,
} = require("../utils/consolidatedReport");
const campsModel = require("../models/camps.model");
const mergeByUrl = require("../scripts/merge");
const ObjectId = require("mongoose").Types.ObjectId;
const { getCamp } = require("../jobs/analytics/helper");
const sendMessage = require('../utils/message')
const renderHTML = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);
const timezone = "Asia/Kolkata";

const render = ejs.compile(renderHTML);

const debug = false;

module.exports = async (req, res) => {
  console.log("Consolidated Report Fetching");
  try {
    let uhidMap = {};
    const labAggregateQuery = [
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
      {
        $group: {
          _id: "$patientId",
          labItems: {
            $push: "$$ROOT",
          },
        },
      },
    ];

    const labCursor = labItemModel
      .aggregate(labAggregateQuery, { allowDiskUse: true })
      .cursor();
   
    let globalCount = 1;
    for (
      let action = await labCursor.next();
      true;
      action = await labCursor.next()
    ) {
      if(!action){
          console.log("last Iteration");
          if (process.env.REPORT_SEND_TO && !debug) {
            await mergeByUrl(Object.values(uhidMap));
          } else {
            console.log("Debug Mode 5");
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
          break;
      };
      console.log(globalCount);
      if ((action.labItems || []).some((item) => item.reportUrl)) {
        const screenings = await ScreeningModel.aggregate([
          {
            $match: {
              $or: [
                {
                  createdAt: {
                    $gte: moment()
                      .subtract(365, "days")
                      .startOf("day")
                      .toDate(),
                  },
                },
                {
                  updatedAt: {
                    $gte: moment()
                      .subtract(365, "days")
                      .startOf("day")
                      .toDate(),
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
            $match: {
              patient: action._id,
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
        ]);

        console.log(screenings.length, "screenings");

        if (screenings && screenings?.length) {
          let pdfLinks = [];
          const camp = getCamp(screenings);
          const patient = screenings[0] ? screenings[0].patient : null;
          const uhid = patient?.uhid;
          const date = screenings[0] ? screenings[0].createdAt : null;
          console.log(patient.uhid, "Uhid");

          if (camp && patient) {
            const details = {
              campId: camp,
              state: camp?.stateName,
              district: camp?.villageName,
              location: `${camp?.talukaName},${camp?.villageName}(${camp?.villagePinCode})`,
              patient: patient,
              screeningDate: camp?.screeningStartDate || date,
              screenings: screenings,
              labItems: action.labItems,
            };
            if (patient?.consolidatedReportUrl &&
              (!req || (req && !req?.body.regenerate))
            ) {
              console.log("Report already generated for :", uhid, uhidMap);
            } else {
              let labReportGenerated = false;
              let screeningReportGenerated = false;

              let {
                results,
                isBasicDone,
                optometryDone,
                audioDone
              } = await getResults({
                screenings,
                campId: camp?._id?.toString(),
                debug,
              });

                if(results && isBasicDone){
                  const buffer = await getEjsFile({
                    render,
                    data: tranformerConsolidatedReportData({
                      patient,
                      resultsObject: results || {},
                      screeningDate: details?.screeningDate,
                      location: details?.campId?.name,
                      district: details.district,
                      state: details.state,
                      optometryDone,
                      audioDone
                    }),
                    fileName: "consolidated-report" + Date.now(),
                  });

                  pdfLinks.push(buffer);
                  screeningReportGenerated = !!buffer;
                }else{
                  await Patient.findByIdAndUpdate(
                    details?.patient?._id,
                    {
                      consolidatedReportStatus: reportGenerationStatus.missingScreenings,
                    },
                    { new: true }
                  );
                }
                
                for (const lab of details.labItems || []) {
                  if (lab && lab?.reportUrl && (lab.reportUrl || '').includes('.pdf')) {
                    console.log(lab, lab.reportUrl,'report url');
                    const labBuffer = await getFileBufferFromUrl(lab?.reportUrl);
                    pdfLinks.push(labBuffer);
                    labReportGenerated = true;
                    break;
                  }
                }

              console.log({ labReportGenerated, screeningReportGenerated });

              if (labReportGenerated && screeningReportGenerated) {
                const updateCamp = await campsModel.findOne({
                  _id: details?.campId._id,
                });

                console.log({
                  previousReportUrl: updateCamp?.reportUrl,
                  _id: updateCamp?._id,
                  pdfLinks
                });

                const globalReportBuffer = updateCamp?.reportUrl
                  ? await getFileBufferFromUrl(updateCamp?.reportUrl)
                  : undefined;

                const { mergedUrl, error: mergeError } = await pdfMerge({
                  pdfLinks,
                });
                
                console.log({mergedUrl, mergeError});

                const { mergedUrl: globalReportUrl, error: globalMergeError } =
                  updateCamp?.reportUrl
                    ? await pdfMerge({
                        pdfLinks: [globalReportBuffer, ...pdfLinks],
                      })
                    : { mergedUrl: null, error: null };

                console.log(globalReportUrl, "global", globalMergeError);

                if (mergeError) {
                  console.log(mergeError, 'merge error');
                  if(req){
                    res.status(500).json('Something went wrong')
                  }
                  continue;
                } else {
                  if (!debug) {
                    await Patient.findByIdAndUpdate(
                      patient?._id,
                      {
                        ...(!req || (req && !req?.body.regenerate)
                          ? {
                              consolidatedReportStatus:
                                reportGenerationStatus.generated,
                            }
                          : {}),
                        consolidatedReportUrl: mergedUrl,
                        consolidatedReportCampId: camp?._id,
                        consolidatedReportGeneratedAt: moment()
                          .tz(timezone)
                          .toISOString(),
                      },
                      { new: true }
                    );
                    console.log("Risk Mode 1");
                  } else {
                    console.log("Debug Mode 1");
                  }

                  if (!debug && (!req || (req && !req?.body.regenerate))) {
                    console.log("updating camp");
                    console.log("Risk Mode 2");

                    const campUpdated = await campsModel.findByIdAndUpdate(
                      camp?._id,
                      {
                        $set: {
                          reportUrl: globalReportUrl
                            ? globalReportUrl
                            : mergedUrl,
                        },
                        $inc: {
                          numberOfConsolidatedReportGenerated: 1,
                        },
                        reportGeneratedAt: moment().tz(timezone).toISOString(),
                      },
                      { new: true }
                    );

                    console.log(campUpdated.reportUrl, camp?._id);

                    const updatedLab = await labItemModel.updateMany(
                      {
                        _id: {
                          $in: (details.labItems || []).map(
                            (item) => item?._id
                          ),
                        },
                      },
                      {
                        $set: {
                          isProcessed: true,
                        },
                      }
                    );
                    
                    await sendMessage({
                      toMultiple: false,
                      to:  details?.patient?.mobile,
                      email: details?.patient?.email,
                      media: { url: mergedUrl },
                      smsParameters: [mergedUrl],
                      templateId: 'healthreport',
                    });
                  
                    await sendMessage({
                      toMultiple: false,
                      to: details?.patient?.mobile,
                      email: details?.patient?.email,
                      media: { url: mergedUrl },
                      smsParameters: [mergedUrl],
                      languageCode: 'kn',
                      templateId: 'healthreportkannada',
                    });
                  
                    const patient = await Patient.findByIdAndUpdate(
                      details?.patient?._id,
                      {
                        consolidatedReportStatus: 'Report Sent',
                        consolidatedReportSentAt: moment().tz(timezone).toISOString(),
                      },
                      { new: true },
                    );
                  } else {
                    console.log("Debug Mode 2");
                  }

                  uhidMap = { ...uhidMap, [uhid]: mergedUrl };

                  console.log({
                    uhidMap,
                    mergedUrl,
                    globalCount,
                    globalReportUrl,
                    campId: camp?._id,
                  });
                }
                pdfLinks = [];
              } else {
                pdfLinks = [];
                if (!debug) {
                  await Patient.findByIdAndUpdate(
                    details?.patient?._id,
                    
                    {
                      consolidatedReportStatus: !labReportGenerated
                        ? reportGenerationStatus.labReportPending
                        : reportGenerationStatus.missingScreenings,
                    },
                    { new: true }
                  );
                  console.log("Risk Mode 3");
                } else {
                  console.log("Debug Mode 3");
                }
              }
            }
          } else {
            pdfLinks = [];
            if (!debug) {
              await Patient.findByIdAndUpdate(
                action?._id,
                {
                  consolidatedReportStatus: reportGenerationStatus.missingScreenings
                },
                { new: true }
              );
              console.log("Risk Mode 9");
            } else {
              console.log("Debug Mode 9");
            }
            console.log("Camp not found!", camp?._id);
          }
          pdfLinks = [];
        } else {
          if (!debug) {
            await Patient.findByIdAndUpdate(
              action?._id,
              {
                consolidatedReportStatus: reportGenerationStatus.missingScreenings
              },
              { new: true }
            );
            console.log("Risk Mode 4");
          } else {
            console.log("Debug Mode 4");
          }
          console.log(
            "Screenings not found for ",
            action.labItems[0] ? action.labItems[0]?.uhid:null
          );
        }
      }
      globalCount = globalCount + 1;
    }
  } catch (e) {
    console.log(e);
    if(req){
      res.status(500).json('Something went wrong')
    }
  }
};
