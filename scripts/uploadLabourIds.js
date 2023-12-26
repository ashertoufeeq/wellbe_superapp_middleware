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
          uploadedOnExternalS3: { $exists: false },
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
    ],
    { allowDiskUse: true }
  );

  for (acion of patientCursor) {
    console.log(i, "th iteration");
    if (action && foldersToDistrictMap[action?.camp?.villageName]) {
      console.log(i, action);
      const labourUrl = action.labourIdFile;
      if (labourUrl) {
        const buffer = await getFileBufferFromUrl(labourUrl);

        const type = labourUrl?.split(".")?.pop() || "pdf";

        var params = {
          ACL: "public-read",
          // ContentType: `application/${type}`,
          Key: `PHC-03/${foldersToDistrictMap[action.camp?.villageName]}-lbr/${
            action?.uhid + "." + type
          }`,
          Body: buffer,
          Bucket: process.env.WELLBE_BUCKET_NAME,
        };
        s3.upload(params, (uploaderr, data1) => {
          if (uploaderr) {
            console.log(uploaderr, "error in uploading");
          }
          console.log(data1?.Location, "uploaded");
        });
      } else {
        console.log("No Labour Id", action.uhid);
      }
      const reportUrl = action.consolidatedReportUrl;
      if (reportUrl) {
        const reportBuffer = await getFileBufferFromUrl(reportUrl);
        const type = "pdf";
        var params = {
          ACL: "public-read",
          // ContentType: `application/${type}`,
          Key: `PHC-03/${foldersToDistrictMap[action.camp?.villageName]}-rpts/${
            action?.uhid + "." + type
          }`,
          Body: reportBuffer,
          Bucket: process.env.WELLBE_BUCKET_NAME,
        };
        s3.upload(params, (uploaderr, data1) => {
          if (uploaderr) {
            console.log(uploaderr, "error in uploading");
          }
          console.log(data1?.Location, "uploaded");
        });
      } else {
        console.log("No Report", action.UHID);
      }
      await Patients.findByIdAndUpdate(
        action?._id,
        {
          $set: {
            uploadedOnExternalS3: true,
          },
        },
        { new: true }
      );
    } else {
    }
    i = i + 1;
  }
};
