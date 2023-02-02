const fs = require("fs");
const axios = require("axios");
const aws = require("aws-sdk");

const PDFMerger = require("pdf-merger-js");
const merger = new PDFMerger();
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET,
  Bucket: process.env.BUCKET_NAME,
});

const getFileBufferFromUrl = (file) =>
  new Promise(async (resolve, reject) => {
    try {
      let { data: pdfBuffer } = await axios.get(file, {
        responseType: "arraybuffer",
      });
      resolve(pdfBuffer);
    } catch (e) {
      reject();
    }
  });

const pdfMerge = ({ pdfLinks = [] }) =>
  new Promise(async (resolve, reject) => {
    try {
      for (const file of pdfLinks) {
        await merger.add(file);
      }
      const mergedPdfBuffer = await merger.saveAsBuffer();

      var params = {
        ACL: "public-read",
        ContentType: "application/pdf",
        Key: "consolidated_report_" + Date.now() + ".pdf",
        Body: mergedPdfBuffer,
        Bucket: process.env.BUCKET_NAME,
      };
      s3.upload(params, (uploaderr, data1) => {
        if (uploaderr) {
          reject(uploaderr);
        }
        resolve({ mergedUrl: data1?.Location });
      });
      // resolve({ mergedUrl: mergedPdfBuffer });
    } catch (e) {
      console.log(e);
      reject({ error: "Something went wrong!" });
    }
  });

module.exports = {
  pdfMerge,
  getFileBufferFromUrl,
};
