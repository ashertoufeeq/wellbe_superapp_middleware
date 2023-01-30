const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const pdf = require("html-pdf");

const shrutiPatient = require('./addShrutiPatient.job')
const ScreeningModel = require('../models/campScreening.model');
const Patient = require('../models/patientRecord');
const labItemModel = require('../models/labItem');
const { uploadEJSPDF, getEjsFile } = require("../utils/upload");
const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const { tranformerConsolidatedReportData } = require("../utils/consolidatedReport");
const campsModel = require("../models/camps.model");
const ObjectId = require('mongoose').Types.ObjectId;

const renderHTML = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);

const render = ejs.compile(renderHTML);



module.exports = async (req, res) => {
  console.log("Consolidated Report Fetching");
  try {
    let detailsMap = {};
    const patientIds = [];
    const today = moment().toISOString();
    const dateFilter = {
      // createdAt: {
      // $gte: moment().subtract(5, 'days').startOf('days').toDate(),
      // $lte: moment(today).endOf('day').toDate()
      // },

      // _id: { $in: [ObjectId('63c87b1d41b31001cfedf951'), ObjectId('63c8a4e90729190cf489e2d8')] },
    }

    const screenings = await ScreeningModel.find({
      ...dateFilter,
      patientId: ObjectId("63ce2592d5b7a02a456dde29")
      // patientId: ObjectId('63ce1870d5b7a02a456dd777')
    }).populate([{ path: 'patientId' }, { path: 'campId' }]).sort({ createdAt: 'asc' }).exec();

    console.log(screenings)

    if (screenings) {
      for (const screening of screenings) {
        if (!(patientIds || []).includes(screening?.patientId?._id)) {
          patientIds.push(screening?.patientId?._id);
        }
        const uhid = screening?.patientId?.uhid;
        detailsMap = {
          ...detailsMap, [uhid]: {
            ...(detailsMap[uhid] || {}),
            campsId: screening?.campId,
            state: screening?.campId?.stateName,
            district: screening?.campId?.villageName,
            location: `${screening?.campId?.talukaName},${screening?.campId?.villageName}(${screening?.campId?.villagePinCode})`,
            patient: screening?.patientId,
            screeningDate: screening?.createdAt,
            screenings: [...((detailsMap[uhid] || {})?.screenings || []), screening]
          }
        }
      }
    }
    if ((patientIds || []).length > 0) {
      const labs = await labItemModel.find({
        ...dateFilter,
        patientId: patientIds
      }).populate([{ path: 'patientId' }])
      if ((labs || []).length > 0) {
        for (const item of labs) {
          const uhid = item?.patientId?.uhid;
          detailsMap = {
            ...detailsMap, [uhid]: {
              ...(detailsMap[uhid] || {}),
              labItems: [...((detailsMap[uhid] || {})?.labItems || []), item]
            }
          }
        }
      }
    }
    let iteration = 0;
    console.log('here------');
    const uhidArray = Object.keys(detailsMap);

    if (iteration < 1) {
      console.log('here------', 1);

      console.log(uhidArray, detailsMap, 're1')
      for (const uhid of uhidArray) {
        const details = detailsMap[uhid];

        if (details?.patient?.consolidatedReportUrl) {
          console.log('Report already generated for :', uhid, details?.patient?.consolidatedReportUrl)
        } else {
          const pdfLinks = [];
          let labReportGenerated = false;
          let screeningReportGenerated = false;
          let results = {

          };
          (details || {}).screenings.map((screening) => {
            if (screening.formsDetails) {
              (screening.formsDetails || []).map((item) => {
                results = { ...results, ...(item.results || {}) }
              })
            }
          })

          // if (req && false) {
          //   const html = render(tranformerConsolidatedReportData({
          //     patient: details?.patient,
          //     resultsObject: results,
          //     screeningDate: details?.screeningDate,
          //     location: details?.location,
          //     district: details.district,
          //     state: details.state,
          //   }));
          //   const title = "moment"

          //   if (!req.query.html) {
          //     console.log('that...')
          //     pdf.create(html).toStream((err, stream) => {
          //       if (err) {
          //         console.log("error generating pdf ->", err);
          //       } else {
          //         res.attachment(title);
          //         res.contentType("application/pdf");
          //         stream.pipe(res);
          //       }
          //     });
          //   } else {
          //     console.log('this...')
          //     res.json({ html, title });
          //   }
          // }

          const buffer = await getEjsFile({
            render, data: tranformerConsolidatedReportData({
              patient: details?.patient,
              resultsObject: results,
              screeningDate: details?.screeningDate,
              location: details?.location,
              district: details.district,
              state: details.state,
            }),
            fileName: 'consolidated-report'
          });
          pdfLinks.push(buffer);
          screeningReportGenerated = !!buffer;

          const labItem = details.labItems || []
          console.log(labItem, '--{{}}--');

          for (const lab of (details.labItems || [])) {
            console.log(lab.packages, 'reportUrl', '--- || ---');
            if (lab?.packages && lab?.packages[0] && lab?.packages[0].reportUrl) {
              const labBuffer = await getFileBufferFromUrl(lab?.packages[0].reportUrl);
              pdfLinks.push(labBuffer);
              labReportGenerated = true;
            }
          }

          if (labReportGenerated && screeningReportGenerated) {
            const { mergedUrl, error: mergeError } = await pdfMerge({ pdfLinks });
            if (mergeError) {
              console.log(mergeError);
            } else {
              const patient = await Patient.findByIdAndUpdate(details?.patient?._id, { consolidatedReportUrl: mergedUrl }, { new: true })
              const campUpdated = await campsModel.findByIdAndUpdate(details?.campsId, {
                $inc: {
                  numberOfConsolidatedReportGenerated: 1
                }
              },
                {
                  new: true
                }
              );
              console.log(patient, campUpdated, patient?.consolidatedReportUrl, '---===---');
            }
          }
          iteration = iteration + 1;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
