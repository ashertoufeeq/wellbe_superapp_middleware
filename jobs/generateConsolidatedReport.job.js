const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const sendMessageBird = require("../utils/message");
const alreadyUpdated = require('../constants/alreadyGeneratedReport')
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
    console.log('Fetching Lab');
    const labs = await labItemModel.aggregate([
      {
        $match:{
          packages: {
            $not: { $elemMatch: { reportUrl: { $exists: false }, cleared: false } },
          },
          "patientId":{
              "$exists": true
           }
        }
      },
      {
      $lookup: {
          from: "patient_records",
          localField: "patientId",
          foreignField: "_id",
          as: "patient"
      }},
      {
          "$unwind":{
           path: '$patient',
           preserveNullAndEmptyArrays: true
      },
      },
      { $addFields: { package: { $first: "$packages" }, patientUhid: "$patient.uhid", patientId:"$patient._id", isReportSent: "$patient.isReportSent"  } },
      {
        $addFields: {
          reportUrl: "$package.reportUrl"
            
       },
      },
      { "$project": {"reportUrl": "$reportUrl", 'uhid': "$patientUhid", patientId: "$patientId", isReportSent: "$isReportSent"}},
   ])

    console.log({labs: labs.length});
    if ((labs || []).length > 0) {
        for (const item of labs) {
          const uhid = item?.uhid;
          if(!item.isReportSent){
          if (!(patientIds || []).includes(item?.patientId)) {
            patientIds.push(item?.patientId);
          }
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
      console.log('Fetching Screening....');
      const screenings = await ScreeningModel.find({
        ...dateFilter,
        patientId: patientIds
        // patientId: ObjectId("63ce417ce34e6e564f3c64f0") //  S
        // patientId: ObjectId("63ce2592d5b7a02a456dde29") // hemant C
        // patientId: ObjectId("63ce417ce34e6e564f3c64f0") // hemant C
        // patientId: ObjectId("63ce2690d5b7a02a456dde9f") //atha
      })
        .populate([{ path: "patientId" }, { path: "campId" }])
        .exec();
  
      console.log(screenings.length, "screenings");
      if ((patientIds || []).length > 0) {
      if (screenings) {
        for (const screening of screenings) {
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
    }
    const uhidArray = Object.keys(detailsMap);

    // console.log(uhidArray, detailsMap, 're1')
    let allPdfs = [];
    let pdfLinks = [];
    let interation = 0;
    let maxInteration = 1000;

    for (const uhid of uhidArray) {
      if (interation < maxInteration) {
        console.log(pdfLinks.length, "pdfLinks start");
        const details = detailsMap[uhid];
        if (details?.patient?.consolidatedReportUrl) {
          console.log(
            "Report already generated for :",
            uhid,
            details?.patient?.consolidatedReportUrl,
            // details?.campId
          );
          if(!alreadyUpdated.includes(uhid)){
            const oldPdf = await getFileBufferFromUrl(
              details?.patient?.consolidatedReportUrl
            );
              allPdfs.push(oldPdf);
              urlMaps = {
              ...urlMaps,
              [uhid]: details?.patient?.consolidatedReportUrl,
          }
          interation = interation + 1;
        }
        } else {
          if((details || {}).screenings){
          let labReportGenerated = false;
          let screeningReportGenerated = false;
          let results = {};

          ((details || {}).screenings).map((screening) => {
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
            if (lab?.reportUrl) {
              const labBuffer = await getFileBufferFromUrl(
                lab?.reportUrl
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
              interation = interation + 1;
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
                languageCode: 'kn',
                smsParameters: [mergedUrl],
                templateId: "healthreportkannada",
              });
              console.log('----------------|--------------', details?.patient?.mobile, details?.patient?._id, Object.keys(urlMaps).length, urlMaps, mergedUrl);
            }}
          } else {
            pdfLinks = [];
          }
        }
        allPdfs = [...allPdfs, ...pdfLinks];
        pdfLinks = [];
        console.log(interation, maxInteration)
        if (interation === maxInteration) {
          const { mergedUrl, error: mergeError } = await pdfMerge({
            pdfLinks: allPdfs,
          });
          if (mergeError) {
            console.log(mergeError,)
          } else {
            if(Object.keys(urlMaps).length>0){
            await Patient.updateMany(
              {
                uhid: {"$in": Object.keys(urlMaps)}
              },
              {
                "$set":{
                  isReportSent: true
                }
              },
              { new: true }
            )
          }
            console.log("final url", mergedUrl, Object.keys(urlMaps).length);
          }
          console.log('Exit')
          return;
        }else{

        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
