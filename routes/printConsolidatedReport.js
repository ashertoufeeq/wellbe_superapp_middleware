const express = require("express");
const router = express.Router();
const fs = require("fs");
const ejs = require("ejs");

const pdf = require("html-pdf");
const path = require("path");

const consolidatedReport = fs.readFileSync(
  path.resolve(__dirname, "../views/consolidatedReport.ejs"),
  "utf8"
);
const render = ejs.compile(consolidatedReport);


const data = {
  name: "RAHUL KUMAR DAS",
  age: "20",
  gender: "Male",
  LabourId: "736437",
  doctorConsultation: "1 to 3",
  lungFunction: "4",
  audiomerty: "5",
  vision: "6",
  remain: "7 to End of Report",
  // page2
  date: "7 Sep",
  phoneNo: "90838383833",
  height: "165",
  weight: "49.9",
  location: "Banglore-Micro electrics",
  mrnNo: " ",
  // page-2 bmi section
  bmi: "18.33",
  bmiStatus: "Normal",
  hydration: "70.4",
  hydrationStatus: "Good",
  fat: "10.4",
  fatStatus: "Athiectic",
  boneMass: "79.07",
  boneStatus: "Good",
  muscle: "79.07",
  muscleStatus: "Good",
  visceralFat: "2",
  visceralFatStatus: "Good",
  metabolicAge: "17",
  metablicStatus: "Good",
  // page-2 blood Pressure section
  systolic: "135",
  systolicStatus: "Pre-Hyper",
  diastolic: "70",
  diastolicStatus: "Normal",
  // page-2 Temparature section
  temperature: "96.98",
  temperatureStatus: "Normal",
  // page-3 Pulse Section
  pulse: "90",
  pulseStatus: "Normal",
  oxygenSat: "97",
  oxygenSatStatus: "Normal",
  // recommedations-page-3
  bmiRecommendation:
    "Healthy weight can be maintained by regularly doing exercise and eating healthy food.",
  fatRecommendation: "No recommendations",
  muscleRecommendation:
    "This is an indication of a fit body. High muscle mass is usually present in people doing high intensity workout",
  hydrationRecommendation:
    "Total Body Water Percentage is the total amount of fluid in a person’s body expressed as a percentage of their total weight.",
  bonemassRecommendation:
    "Usually athletes and people doing high intensity workout has high bone mass, however if its related to an underlying cause, please consult doctor",
  metabloicRangeRecommendation:
    "Having a higher basal metabolism increases the number of calories used and helps decrease the amount of body. A low basal metabolic rate makes it harder to lose body fat and overall weight",
  visceralFatRecommendation:
    "Visceral fat is the fat that is in the internal abdominal cavity, surrounding the vital organs.Continue monitoring to ensure that it stays within this healthy range",
  metabolicAgeRecommendation:
    "Your metabolic age is fine. You have healthy muscle tissue which improves your metabolic age ",
  muscleQualityScoreRecommendation:
    "The muscles of young people or those who exercise regularly is normally in agood state",
  systolicRecommendation:
    "Exercise helps lower blood pressure,try meditation or deep breathing. Eat calcium-rich foods, cut added sugar and refined carbs, eat foods rich in magnesium.",
  diastolicRecommendation: "no comments",
  pulseRecommendation: "No comments",
  // PAGE-4
  stethoscopyResults: [
    "CVS-S1 and S2 heard,no murmer",
    "RS-air entry both side norma",
  ],
  dermascopyResult: ["The Skin appears to be normal"],
  // page-5 copd screeing report
  subjectId: "717",
  regressionSet: "ERS93/Polgar",
  testDate: "10-09-2022",
  valuesAtBTPS: "",
  deviceId: "197911",
  DeviceSoftwareRef: "404913 V1.03",
  NoOfBlows: "1",
  NoOfGoodBlows: "0",
  bestFev1Within: "-",
  bestFev6Withing: "-",
  results: [
    {
      parameter: "FEV1 (L)",
      predicted: "4.04",
      test1: "2.28",
      test2: "",
      test3: "",
      best: "2.28",
      pred: "0.56",
    },
    {
      parameter: "FEV6 (L)",
      predicted: "4.73",
      test1: "4.24",
      test2: "",
      test3: "",
      best: "4.24",
      pred: "0.90",
    },
    {
      parameter: "FEV6/FEV6 (ration)",
      predicted: "0.84",
      test1: "0.54",
      test2: "",
      test3: "",
      best: "0.54",
      pred: "0.64",
    },
  ],
  obstructiveIndex: "Mild", // Uppercase must be to shwo at correct index
  copdClassfication: 1,
  lungAge: "76",
  obstructiveIndexPercent: "63",
  interpretation: "Mild COPD indicated",
  // page-6
  screenDate: "10-09-2023",
  screeingAddress: "Banglore-Micron elecricals, marathahalli",
  patientId: "6512356",
  provisionalDiagnosis: "Hearing screening appears to be Normal",
  isHearingScreeningDone: "Yes",
  leftEar: {
    "500Hz": "N",
    "1000Hz": "N",
    "2000Hz": "N",
    "4000Hz": "N",
  },
  rightEar: {
    "500Hz": "N",
    "1000Hz": "N",
    "2000Hz": "N",
    "4000Hz": "N",
  },
  recommendations: {
    pureTone: "",
    impediance: "",
    hearingAid: "",
    other: "",
    ent: "",
  },
  // page-7
  alokaId: "0500200112",
  district: "Banlore Urban",
  state: "Karnataka",
  eyeExamination: "Normal",
  visualAcuity: {
    RE: "6",
    TRE: "6",
    LE: "6",
    TLE: "6",
  },
  prescription: {
    re: {
      sph: 0,
      cyl: 0,
      axis: 0,
      add: 0,
    },
    le: {
      sph: 0,
      cyl: 0,
      axis: 0,
      add: 0,
    },
  },
  diagnosis: "Bilateral Vision is found to be Normal",
};

router.get("/print", (req, res) => {
  const html = render(data);
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

  // res.render("../views/consolidatedReport.ejs", { ...data });

});

module.exports = router;
