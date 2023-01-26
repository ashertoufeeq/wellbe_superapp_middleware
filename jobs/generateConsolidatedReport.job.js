const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const pdf = require("html-pdf");

const shrutiPatient = require('./addShrutiPatient.job')
const ScreeningModel = require('../models/campScreening.model');
const labItemModel = require('../models/labItem');
const { uploadEJSPDF } = require("../utils/upload");
const { tranformerConsolidatedReportData } = require("../utils/consolidatedReport");
const ObjectId = require('mongoose').Types.ObjectId;

const renderHTML = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);

const render = ejs.compile(renderHTML);



module.exports = async (req, res) => {
  console.log("Consolidated Report Fetching");
  // const screeningCount = await ScreeningModel.find({}).count();
  // console.log(screeningCount);
  try {
    let detailsMap = {};
    const patientIds = [];
    const today = moment().toISOString();
    const dateFilter = {
      createdAt: {
        $gte: moment().subtract(5, 'days').startOf('days').toISOString(),
        $lte: moment(today).endOf('day').toISOString()
      },

      // _id: { $in: [ObjectId('63c87b1d41b31001cfedf951'), ObjectId('63c8a4e90729190cf489e2d8')] },
    }
    const screenings = await ScreeningModel.find({
      ...dateFilter,
      patientId: ObjectId('63d11ba27219d523dac1769f')
    }).populate([{ path: 'patientId' }, { path: 'campId' }]).exec();

    if (screenings) {
      (screenings || []).map((screening) => {
        if (!(patientIds || []).includes(screening?.patientId?._id)) {
          patientIds.push(screening?.patientId?._id);
        }
        const uhid = screening?.patientId?.uhid;
        detailsMap = {
          ...detailsMap, [uhid]: {
            ...(detailsMap[uhid] || {}),
            state: screening?.campId?.stateName,
            district: screening?.campId?.villageName,
            location: `${screening?.campId?.talukaName},${screening?.campId?.villageName}(${screening?.campId?.villagePinCode})`,
            patient: screening?.patientId,
            screeningDate: screening?.createdAt,
            screenings: [...((detailsMap[uhid] || {})?.screenings || []), screening]
          }
        }
      })
    }
    if ((patientIds || []).length > 0) {
      const labs = await labItemModel.find({
        ...dateFilter,
        patientId: patientIds
      }).populate([{ path: 'patientId' }])
      // console.log(labs, '---')
      if ((labs || []).length > 0) {
        (labs || []).map((item) => {
          const uhid = item?.patientId?.uhid;
          detailsMap = {
            ...detailsMap, [uhid]: {
              ...(detailsMap[uhid] || {}),
              labItems: [...((detailsMap[uhid] || {})?.labItems || []), item]
            }
          }
        })
      }
    }
    let iteration = 0;
    if (iteration < 1) {
      Object.keys(detailsMap || {}).map((uhid) => {
        let results = {

        };
        const details = detailsMap[uhid];
        (details || {}).screenings.map((screening) => {
          if (screening.formsDetails) {
            (screening.formsDetails || []).map((item) => {
              results = { ...results, ...(item.results || {}) }
            })
          }
        })
        if (req) {
          const html = render(tranformerConsolidatedReportData({
            patient: details?.patient,
            resultsObject: results,
            screeningDate: details?.screeningDate,
            location: details?.location,
            district: details.district,
            state: details.state,
          }));
          const title = "moment"
          if (!req.query.html) {
            pdf.create(html).toStream((err, stream) => {
              if (err) {
                console.log("error generating pdf ->", err);
              } else {
                res.attachment(title);
                res.contentType("application/pdf");
                stream.pipe(res);
              }
            });
          } else {
            res.json({ html, title });
          }
        }
      })
      // shrutiPatient()
      // const { link } = await uploadEJSPDF({ render, data: { ...test, ...results }, fileName: 'consolidated-report' })
      // console.log(link, 'asher')
    }
  } catch (e) {
    console.log(e);
  }
};
