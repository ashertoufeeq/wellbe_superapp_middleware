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
  reportGenerationStatus
} = require("../utils/consolidatedReport");
const campsModel = require("../models/camps.model");
const mergeByUrl = require("../scripts/merge");
const ObjectId = require("mongoose").Types.ObjectId;
const {getCamp} = require('../jobs/analytics/helper')


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
    let uhidMap = {};
    const labAggregateQuery = [{
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
    }
    }];

    const labCount = await labItemModel.aggregate([
      ...labAggregateQuery,
      {"$count": 'total'}
    ],{ allowDiskUse: true }
    );

    const labCursor = labItemModel.aggregate(labAggregateQuery,{ allowDiskUse: true }
    ).cursor();

    let globalCount = 1;
    
    for(
      let action = await labCursor.next();
      action != null;
      action = await labCursor.next()
      ){
        console.log(globalCount, labCount)
       if((action.labItems || []).some(item => item.reportUrl)){
        const screenings = await ScreeningModel.aggregate(
          [
            {
              $match: {
                $or: [
                  {
                    createdAt: {
                      $gte: moment().subtract(365, "days").startOf("day").toDate(),
                    },
                  },
                  {
                    updatedAt: {
                      $gte: moment().subtract(365, "days").startOf("day").toDate(),
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
                patient:  action._id ,
              }
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
            }
          ]
        );  

        console.log(screenings.length, "screenings");

      if (screenings && screenings?.length) {
          let pdfLinks = [];
          const camp =  getCamp(screenings);
          const patient  = screenings[0]?screenings[0].patient : null;
          const uhid  = patient?.uhid;
          const date  = screenings[0]?screenings[0].createdAt : null;
          console.log(patient.uhid,'Test');

          if(camp && patient){
            const details = {
              campId: camp,
                  state: camp?.stateName,
                  district: camp?.villageName,
                  location: `${camp?.talukaName},${camp?.villageName}(${camp?.villagePinCode})`,
                  patient: patient,
                  screeningDate: camp?.screeningStartDate || date,
                  screenings: screenings,
                  labItems: action.labItems,
            } 
            if (patient?.consolidatedReportUrl && (!req || (req && (!req?.body.regenerate)))) {
              console.log("Report already generated for :", uhid);
              uhidMap = {
                ...uhidMap,
                [uhid]: details?.patient?.consolidatedReportUrl,
              };
            } else {
              let labReportGenerated = false;
              let screeningReportGenerated = false;
              let results = {};

              (screenings || []).map((screening) => {
                if (screening.formsDetails) {
                  (screening.formsDetails || []).map((item) => {
                    results = { ...results, ...(item.results || {}) };
                  });
                }
              });
  
              const buffer = await getEjsFile({
                render,
                data: tranformerConsolidatedReportData({
                  patient,
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

              if(labReportGenerated && screeningReportGenerated){
                const updateCamp = await campsModel.findOne({
                  _id: details?.campId._id,
                });

                console.log({
                  previousReportUrl: updateCamp?.reportUrl,
                  _id: updateCamp?._id,
                });
                const globalReportBuffer = updateCamp?.reportUrl
                  ? await getFileBufferFromUrl(updateCamp?.reportUrl)
                  : undefined;

                console.log("global buffer", !!globalReportBuffer, updateCamp?.reportUrl);
                
                const { mergedUrl, error: mergeError } = await pdfMerge({
                  pdfLinks,
                });
  
                const { mergedUrl: globalReportUrl, error: globalMergeError } =
                  updateCamp?.reportUrl
                    ? await pdfMerge({
                        pdfLinks: [globalReportBuffer, ...pdfLinks],
                      })
                    : { mergedUrl: null, error: null };

                console.log(globalReportUrl, "global", globalMergeError);

                if (mergeError) {
                  console.log(mergeError);
                  continue;
                } else {

                  await Patient.findByIdAndUpdate(
                    patient?._id,
                    {
                    ...((!req || (req && !req?.body.regenerate)) ? { consolidatedReportStatus: reportGenerationStatus.reportSent}:{}),
                      consolidatedReportUrl: mergedUrl,
                      consolidatedReportCampId: camp?._id,
                      consolidatedReportGeneratedAt: moment()
                        .tz(timezone)
                        .toISOString(),
                    },
                    { new: true }
                  );
  
                  if (!req || false && (req && !req?.body.regenerate)) {
                    console.log("updating camp");
  
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
                        reportGeneratedAt: moment()
                        .tz(timezone)
                        .toISOString(),
                      },
                      { new: true }
                    );
  
                    console.log(campUpdated.reportUrl, camp?._id);
  
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
              }else{
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
          } else{
            pdfLinks = [];
            console.log('Camp not found!', camp?._id);
          }
          pdfLinks = [];
        }else {
        await Patient.findByIdAndUpdate(
          details?.patient?._id,
          {
            consolidatedReportStatus: reportGenerationStatus.missingScreenings
          },
          { new: true }
        );
        console.log('Screenings not found for ', screenings[0]? screenings[0]?.patientId: null);
      }
    }

      if(globalCount === (labCount  && labCount[0] && labCount[0]?.total) ){
        console.log('last Iteration');
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
      globalCount = globalCount + 1;
  }
  } catch (e) {
    console.log(e);
  }
};
