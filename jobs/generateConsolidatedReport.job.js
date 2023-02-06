const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const sendMessageBird = require("../utils/message");

const shrutiPatient = require("./addShrutiPatient.job");
const ScreeningModel = require("../models/campScreening.model");
const Patient = require("../models/patientRecord");
const labItemModel = require("../models/labItem");
const { uploadEJSPDF, getEjsFile } = require("../utils/upload");
const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const {
  tranformerConsolidatedReportData,
} = require("../utils/consolidatedReport");
const campsModel = require("../models/camps.model");
const ObjectId = require("mongoose").Types.ObjectId;

const renderHTML = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);

const render = ejs.compile(renderHTML);

module.exports = async (req, res) => {
  console.log("Consolidated Report Fetching");
  try {
    let urlMaps = {};
    let detailsMap = {};
    const patientIds = [];
    const today = moment().toISOString();
    const dateFilter = {
      // createdAt: {
      //   $gte: moment().subtract(7, "days").startOf("days").toDate(),
      //   $lte: moment().subtract(5, "days").endOf("days").toDate(),
      // },
      // createdAt: {
      //   $gte: moment().subtract(5, 'days').startOf('days').toDate(),
      //   $lte: moment(today).endOf('day').toDate()
      // },
    };

    const screenings = await ScreeningModel.find({
      ...dateFilter,
      // patientId: ObjectId("63ce417ce34e6e564f3c64f0") //  S
      // patientId: ObjectId("63ce2592d5b7a02a456dde29") // hemant C
      // patientId: ObjectId("63ce417ce34e6e564f3c64f0") // hemant C
      // patientId: ObjectId("63ce2690d5b7a02a456dde9f") //atha
    })
      .populate([{ path: "patientId" }, { path: "campId" }])
      .sort({ createdAt: "asc" })
      .exec();

    console.log(screenings.length, "screenings");

    if (screenings) {
      for (const screening of screenings) {
        if (!(patientIds || []).includes(screening?.patientId?._id)) {
          patientIds.push(screening?.patientId?._id);
        }
        const uhid = screening?.patientId?.uhid;
        detailsMap = {
          ...detailsMap,
          [uhid]: {
            ...(detailsMap[uhid] || {}),
            campId: screening?.campId,
            state: screening?.campId?.stateName,
            district: screening?.campId?.villageName,
            location: `${screening?.campId?.talukaName},${screening?.campId?.villageName}(${screening?.campId?.villagePinCode})`,
            patient: screening?.patientId,
            screeningDate: screening?.createdAt,
            screenings: [
              ...((detailsMap[uhid] || {})?.screenings || []),
              screening,
            ],
          },
        };
      }
    }
    if ((patientIds || []).length > 0) {
      const labs = await labItemModel
        .find({
          ...dateFilter,
          patientId: patientIds,
        })
        .populate([{ path: "patientId" }]);
      if ((labs || []).length > 0) {
        for (const item of labs) {
          const uhid = item?.patientId?.uhid;
          detailsMap = {
            ...detailsMap,
            [uhid]: {
              ...(detailsMap[uhid] || {}),
              labItems: [...((detailsMap[uhid] || {})?.labItems || []), item],
            },
          };
        }
      }
    }
    const uhidArray = Object.keys(detailsMap);

    // console.log(uhidArray, detailsMap, 're1')
    let allPdfs = [];
    let pdfLinks = [];
    let interation = 1;

    for (const uhid of uhidArray) {
      if (interation < 2) {
        console.log(pdfLinks.length, "pdfLinks start");
        const details = detailsMap[uhid];

        if (details?.patient?.consolidatedReportUrl) {
          console.log(
            "Report already generated for :",
            uhid
            // details?.patient?.consolidatedReportUrl,
            // details?.campId
          );
        } else {
          let labReportGenerated = false;
          let screeningReportGenerated = false;
          let results = {};

          (details || {}).screenings.map((screening) => {
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
              location: details?.location,
              district: details.district,
              state: details.state,
            }),
            fileName: "consolidated-report" + Date.now(),
          });
          pdfLinks.push(buffer);
          screeningReportGenerated = !!buffer;

          for (const lab of details.labItems || []) {
            if (lab?.packages && lab?.packages[0] && lab?.packages[0].reportUrl) {
              const labBuffer = await getFileBufferFromUrl(
                lab?.packages[0].reportUrl
              );
              pdfLinks.push(labBuffer);
              labReportGenerated = true;
            }
          }
          console.log({ labReportGenerated, screeningReportGenerated });
          if (labReportGenerated && screeningReportGenerated) {
            console.log(pdfLinks.length, "pdfLinks");
            const { mergedUrl, error: mergeError } = await pdfMerge({ pdfLinks });
            if (mergeError) {
              console.log(mergeError);
            } else {
              const patient = await Patient.findByIdAndUpdate(
                details?.patient?._id,
                {
                  consolidatedReportUrl: mergedUrl,
                  consolidatedReportGeneratedAt: today,

                },
                { new: true }
              );
              const campUpdated = await campsModel.findByIdAndUpdate(
                details?.campId,
                {
                  $inc: {
                    numberOfConsolidatedReportGenerated: 1,
                  },
                },
                {
                  new: true,
                }
              );
              urlMaps = {
                ...urlMaps,
                [uhid]: mergedUrl,
              };
              //['8882223210', '8867420141', '8105348885', '9845321258', '9557807977'] 
              interation = interation + 1;
              console.log(details?.patient?.mobile, '---- patient ----')
              const res = await sendMessageBird({
                toMultiple: true,
                to: details?.patient?.mobile,
                media: { url: mergedUrl },
                smsParameters: [mergedUrl],
                templateId: "healthreport",
              });
              const res2 = await sendMessageBird({
                toMultiple: true,
                to: details?.patient?.mobile,
                media: { url: mergedUrl },
                languageCode: 'kn',
                smsParameters: [mergedUrl],
                templateId: "healthreportkannada",
              });
              console.log('----------------|--------------', patient?._id, Object.keys(urlMaps).length, urlMaps, mergedUrl);
            }
          } else {
            pdfLinks = [];
          }
        }
        allPdfs = [...allPdfs, ...pdfLinks];
        pdfLinks = [];
      }


      const { mergedUrl, error: mergeError } = await pdfMerge({
        pdfLinks: allPdfs,
      });
      if (mergeError) {
        console.log(mergeError)
      } else {
        console.log("final url", mergedUrl);
      }

    }
  } catch (e) {
    console.log(e);
  }
};
