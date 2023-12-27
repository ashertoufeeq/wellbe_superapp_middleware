const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const sendMessageBird = require("../utils/message");
const { analyticsModel } = require("../models/analytics.model");
const Patients = require("../models/patientRecord");
const moment = require("moment");
const aws = require("aws-sdk");

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

module.exports = async () => {
  i = 1;
  console.log("fetching patients");
  const patientCursor = await Patients.aggregate(
    [
      {
        $match: {
          labourIdFile: { $exists: true },
          consolidatedReportCampId: { $exists: true },
          consolidatedReportUrl: { $exists: true },
          externalBucketReportUrl: { $exists: false },
          createdAt: { $gte: cutoff },
        },
      },
      {
        $lookup: {
          from: "camps",
          localField: "consolidatedReportCampId",
          foreignField: "_id",
          as: "camp",
        },
      },
      {
        $unwind: {
          path: "$camp",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "program_mgmts",
          localField: "camp.programId",
          foreignField: "_id",
          as: "workOrder",
        },
      },
      {
        $unwind: {
          path: "$workOrder",
          preserveNullAndEmptyArrays: true,
        },
      },
    ],
    { allowDiskUse: true }
  ).limit(1000);

  const allPatients = process.env.VILLAGE
    ? patientCursor.filter((p) => p?.camp?.villageName === process.env.VILLAGE)
    : patientCursor;

  console.log(
    "total ->",
    patientCursor.length,
    "fitlered ->",
    allPatients.length
  );
  delete patientCursor;
  for (const action of allPatients) {
    console.log(i, "th iteration");
    const folderName = foldersToDistrictMap[action?.camp?.villageName]
      ? foldersToDistrictMap[action?.camp?.villageName]
      : foldersToDistrictMap[action?.workOrder?.programShortCode];
    if (action && folderName) {
      console.log(i, action);
      const labourUrl = action.labourIdFile;
      let newReportUrl;
      let newLabourUrl;
      let bucketName = foldersToDistrictMap[action?.camp?.villageName];
      if (labourUrl) {
        const buffer = await getFileBufferFromUrl(labourUrl);

        const type = labourUrl?.split(".")?.pop() || "pdf";

        var params = {
          ACL: "public-read",
          ContentType: type === "pdf" ? `application/pdf` : `image/${type}`,
          Key: `PHC-03/${foldersToDistrictMap[action.camp?.villageName]}-lbr/${
            action?.uhid + "." + type
          }`,
          Body: buffer,
          Bucket: process.env.WELLBE_BUCKET_NAME,
        };
        try {
          const data1 = await s3.upload(params).promise();
          console.log("uploaded labour ->", data1.Location);
          newLabourUrl = data1.Location;
        } catch (err) {
          console.log(err, "error in uploading");
        }
      } else {
        console.log("No Labour Id", action.uhid);
      }
      const reportUrl = action.consolidatedReportUrl;

      if (reportUrl) {
        const reportBuffer = await getFileBufferFromUrl(reportUrl);
        const type = "pdf";
        var params = {
          ACL: "public-read",
          ContentType: `application/pdf`,
          Key: `PHC-03/${foldersToDistrictMap[action.camp?.villageName]}-rpts/${
            action?.uhid + "." + type
          }`,
          Body: reportBuffer,
          Bucket: process.env.WELLBE_BUCKET_NAME,
        };
        try {
          const data1 = await s3.upload(params).promise();
          console.log("uploaded report->", data1.Location);
          newReportUrl = data1.Location;
        } catch (err) {
          console.log(err, "error in uploading");
        }
      } else {
        console.log("No Report", action.UHID);
      }
      await Patients.findByIdAndUpdate(
        action?._id,
        {
          $set: {
            externalBucketReportUrl: newReportUrl,
            externalBucketLabourUrl: newLabourUrl,
            externalBucketName: bucketName,
          },
        },
        { new: true }
      );
    } else {
      console.log("skipping");
    }
    i = i + 1;
  }
};
