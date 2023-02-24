const Patient = require('../models/patientRecord');
const express = require("express");
const router = express.Router();
const sendMessageBird = require("../utils/message");
const moment = require("moment");
const jobs = require("../jobs");



const timezone = 'Asia/Kolkata'
const {mergeByUrl} = require('../scripts')

router.post("/generateReport", async (req, res) => {
  console.log('called')
  try{
    const { patientId, regenerate } = req.body;
    const patient = await  Patient.findOne({_id: patientId});
    if(patient.consolidatedReportUrl && !regenerate){
      console.log('sending...');
      const {consolidatedReportUrl} = patient;
      await sendMessageBird({
        toMultiple: false,
        to: patient.mobile,
        media: { url: consolidatedReportUrl },
        smsParameters: [consolidatedReportUrl],
        templateId: "healthreport",
      });

      await sendMessageBird({
        toMultiple: false,
        to: patient.mobile,
        media: { url: consolidatedReportUrl },
        smsParameters: [consolidatedReportUrl],  
              languageCode: "kn",
        templateId: "healthreportkannada",
      });
      res.status(200).json({success:true, sent: true, [patient.uhid]: patient.consolidatedReportUrl})
    }else{
      console.log('Generating...', ', Regenerate : ', regenerate);
      jobs.generateConsolidatedReport(req, res);
    }
  }
  catch(e){
      res.status(500).json('Something went wrong');
  }
});

router.post("/merge", async (req, res) => {
  try{
    console.log('called...')
    const url = await mergeByUrl(req.body.urls||[]);
    console.log('url...', url)
    res.status(200).json(url);
  }
  catch(e){
      res.status(500).json('Something went wrong');
  }
});

module.exports = router;
