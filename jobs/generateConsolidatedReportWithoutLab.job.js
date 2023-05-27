const axios = require("axios");
const moment = require("moment");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const ScreeningModel = require("../models/campScreening.model");
const Patient = require("../models/patientRecord");

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
const sendMessage = require("../utils/message");
const renderHTML = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);
const timezone = "Asia/Kolkata";

const render = ejs.compile(renderHTML);

const debug = false;

module.exports = async (req, res) => {
  try {
    const screeningAggregation = [
      {
        $match: {
          isProcessed: { $ne: true },
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
    ];
    const screenings = await ScreeningModel.aggregate(screeningAggregation);
    for (const screening of screenings) {
      let pdfLinks = [];
      const camp = getCamp([screening]);
      const patient = screening.patient || null;
      const uhid = patient?.uhid;
      const date = screening.createdAt || null;
      console.log(patient.uhid, "Uhid");
      if (camp && patient) {
        const details = {
          campId: camp,
          state: camp?.stateName,
          district: camp?.villageName,
          location: `${camp?.talukaName},${camp?.villageName}(${camp?.villagePinCode})`,
          patient: patient,
          screeningDate: camp?.screeningStartDate || date,
          screenings: [screening],
          labItems: [],
        };
        if (
          patient?.consolidatedReportUrl &&
          (!req || (req && !req?.body.regenerate))
        ) {
          console.log("Report already generated for :", uhid, uhidMap);
        } else {
          let screeningReportGenerated = false;

          let { results, isBasicDone, optometryDone, audioDone } =
            await getResults({
              screenings: [screening],
              campId: camp?._id?.toString(),
              debug,
            });
          if (results && isBasicDone) {
            try {
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
                  audioDone,
                }),
                fileName: "consolidated-report" + Date.now(),
              });
              pdfLinks.push(buffer);
              screeningReportGenerated = !!buffer;
            } catch (e) {
              console.log(e);
              await Patient.findByIdAndUpdate(
                details?.patient?._id,
                {
                  consolidatedReportStatus: reportGenerationStatus.unknown,
                },
                { new: true }
              );
              const updatedScreening = await ScreeningModel.findByIdAndUpdate(
                screening._id,
                {
                  $set: {
                    isProcessed: true,
                  },
                }
              );
              console.log("unknown error", details?.patient?._id);
              continue;
            }
          } else {
            await Patient.findByIdAndUpdate(
              details?.patient?._id,
              {
                consolidatedReportStatus:
                  reportGenerationStatus.missingScreenings,
              },
              { new: true }
            );
            const updatedScreening = await ScreeningModel.findByIdAndUpdate(
              screening._id,
              {
                $set: {
                  isProcessed: true,
                },
              }
            );
          }
          if (screeningReportGenerated) {
            const updateCamp = await campsModel.findOne({
              _id: details?.campId._id,
            });
            const globalReportBuffer = updateCamp?.reportUrl
              ? await getFileBufferFromUrl(updateCamp?.reportUrl)
              : undefined;
            const { mergedUrl, error: mergeError } = await pdfMerge({
              pdfLinks,
            });
            console.log({ mergedUrl, mergeError });

            const { mergedUrl: globalReportUrl, error: globalMergeError } =
              updateCamp?.reportUrl
                ? await pdfMerge({
                    pdfLinks: [globalReportBuffer, ...pdfLinks],
                  })
                : { mergedUrl: null, error: null };

            console.log(globalReportUrl, "global", globalMergeError);
            if (mergeError) {
              console.log(mergeError, "merge error");
              if (req) {
                res.status(500).json("Something went wrong");
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
                      reportUrl: globalReportUrl ? globalReportUrl : mergedUrl,
                    },
                    $inc: {
                      numberOfConsolidatedReportGenerated: 1,
                    },
                    reportGeneratedAt: moment().tz(timezone).toISOString(),
                  },
                  { new: true }
                );

                console.log(campUpdated.reportUrl, camp?._id);

                const updatedScreening = await ScreeningModel.findByIdAndUpdate(
                  screening._id,
                  {
                    $set: {
                      isProcessed: true,
                    },
                  }
                );

                await sendMessage({
                  toMultiple: false,
                  to: details?.patient?.mobile,
                  email: details?.patient?.email,
                  media: { url: mergedUrl },
                  smsParameters: [mergedUrl],
                  templateId: "healthreport",
                });

                await sendMessage({
                  toMultiple: false,
                  to: details?.patient?.mobile,
                  email: details?.patient?.email,
                  media: { url: mergedUrl },
                  smsParameters: [mergedUrl],
                  languageCode: "kn",
                  templateId: "healthreportkannada",
                });

                const patient = await Patient.findByIdAndUpdate(
                  details?.patient?._id,
                  {
                    consolidatedReportStatus: "Report Sent",
                    consolidatedReportSentAt: moment()
                      .tz(timezone)
                      .toISOString(),
                  },
                  { new: true }
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
                  consolidatedReportStatus:
                    reportGenerationStatus.missingScreenings,
                },
                { new: true }
              );

              const updatedScreening = await ScreeningModel.findByIdAndUpdate(
                screening._id,
                {
                  $set: {
                    isProcessed: true,
                  },
                }
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
              consolidatedReportStatus:
                reportGenerationStatus.missingScreenings,
            },
            { new: true }
          );
          const updatedScreening = await ScreeningModel.findByIdAndUpdate(
            screening._id,
            {
              $set: {
                isProcessed: true,
              },
            }
          );
          console.log("Risk Mode 9");
        } else {
          console.log("Debug Mode 9");
        }
        console.log("Camp not found!", camp?._id);
      }
      pdfLinks = [];
    }
  } catch (err) {
    console.log(err);
    if (req) {
      res.status(500).json("Something went wrong");
    }
  }
};
