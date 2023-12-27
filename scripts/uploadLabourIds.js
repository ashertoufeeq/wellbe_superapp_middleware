const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const sendMessageBird = require("../utils/message");
const { analyticsModel } = require("../models/analytics.model");
const Patients = require("../models/patientRecord");
const moment = require("moment");
const aws = require("aws-sdk");
const _ = require("lodash");
const data = require("./wellbeaws.json");

const s3 = new aws.S3({
  accessKeyId: process.env.WELLBE_S3_ACCESS_KEY,
  secretAccessKey: process.env.WELLBE_S3_SECRET,
  Bucket: process.env.WELLBE_BUCKET_NAME,
});

const foldersToDistrictMap = {
  Chitradurga: "chitradurga",
  Karwar: "karwar",
  Shimoga: "shivmoga",
  Belgaum: "belgavi-01",
  Bellary: "bellary",
  Gulbarga: "kalburgi",
  Bagalkot: "bagalkot",
  "Bijapur(KAR)": "bijapur",
  Hassan: "hassan",
  Mandya: "mandya",
  Raichur: "raichur",
  Ramanagar: "ramanagar",
  Tumkur: "tumkur",
  Vijayanagar: "vijaynagara",
  "hubli-div02": "hubli-div01",
  "hubli-div01": "hubli-div02",
  "bnglr - div05": "bengaluru-div05",
  "bnglr - div03": "bengaluru-div03",
  "bnglr - div06": "bengaluru-div06",
  Dharwad: "hubli-div01",
};

const cutoff = moment().subtract(3, "months").startOf("day").toDate();

const batchRunner = async (patients, index) => {
  i = 1;
  console.log("running script for ->", `[${index}]`);
  console.log("total ->", patients.length, `[${index}]`);

  for (const action of patients) {
    console.log(i, "th iteration", `[${index}]`);
    const folderName = foldersToDistrictMap[action.villageName]
      ? foldersToDistrictMap[action.villageName]
      : foldersToDistrictMap[action.workOrder];
    if (action && folderName) {
      console.log(i, action, `[${index}]`);
      const labourUrl = action.labourIdFile;
      let newReportUrl;
      let newLabourUrl;
      if (labourUrl) {
        const buffer = await getFileBufferFromUrl(labourUrl);

        const type = labourUrl?.split(".")?.pop() || "pdf";

        var params = {
          ACL: "public-read",
          ContentType: type === "pdf" ? `application/pdf` : `image/${type}`,
          Key: `PHC-03/${folderName}-lbr/${action?.uhid + "." + type}`,
          Body: buffer,
          Bucket: process.env.WELLBE_BUCKET_NAME,
        };
        try {
          const data1 = await s3.upload(params).promise();
          console.log("uploaded labour ->", data1.Location, `[${index}]`);
          newLabourUrl = data1.Location;
        } catch (err) {
          console.log(err, "error in uploading");
        }
      } else {
        console.log("No Labour Id", action.uhid, `[${index}]`);
      }
      const reportUrl = action.reportFile;

      if (reportUrl) {
        const reportBuffer = await getFileBufferFromUrl(reportUrl);
        const type = "pdf";
        var params = {
          ACL: "public-read",
          ContentType: `application/pdf`,
          Key: `PHC-03/${folderName}-rpts/${action?.uhid + "." + type}`,
          Body: reportBuffer,
          Bucket: process.env.WELLBE_BUCKET_NAME,
        };
        try {
          const data1 = await s3.upload(params).promise();
          console.log("uploaded report->", data1.Location, `[${index}]`);
          newReportUrl = data1.Location;
        } catch (err) {
          console.log(err, "error in uploading", `[${index}]`);
        }
      } else {
        console.log("No Report", action.uhid, `[${index}]`);
      }
      await Patients.findOneAndUpdate(
        { uhid: action.uhid },
        {
          $set: {
            externalBucketReportUrl: newReportUrl,
            externalBucketLabourUrl: newLabourUrl,
            externalBucketName: folderName,
          },
        },
        { new: true }
      );
    } else {
      console.log("skipping", `[${index}]`);
    }
    i = i + 1;
  }
};

const batches = _.chunk(data, 5000);
module.exports = async () => {
  await Promise.all(batches.map((batch, index) => batchRunner(batch, index)));
  console.log("All Done");
};
