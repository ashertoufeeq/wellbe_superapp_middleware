const pdf = require("html-pdf");
const path = require("path");
const fs = require("fs");
const aws = require("aws-sdk");

const uploadEJSPDF = ({ render, data, fileName }) =>
  new Promise((resolve, reject) => {
    const html = render(data);
    pdf.create(html).toFile((err, file) => {
      if (err) {
        console.log("error generating pdf ->", err);
      } else {
        const s3 = new aws.S3({
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET,
          Bucket: process.env.BUCKET_NAME,
        });
        fs.readFile(file.filename, function (err1, data) {
          if (err1) {
            console.log(err1);
            res.status(500).json({ err: "Could not read file " });
          }
          var params = {
            ACL: "public-read",
            ContentType: "application/pdf",
            Key:
              path
                .basename(
                  fileName || "RegistrationReceipt",
                  path.extname(file.filename)
                )
                .trim()
                .split(" ")
                .join() +
              "-" +
              Date.now() +
              path.extname(file.filename).trim(),
            Body: data,
            Bucket: process.env.BUCKET_NAME,
          };
          s3.upload(params, (uploaderr, data1) => {
            if (uploaderr) {
              console.log(uploaderr);
              reject(uploaderr);
            }
            fs.unlinkSync(file.filename);
            resolve({ link: data1?.Location });
          });
        });
      }
    });
  });

const getEjsFile = ({ render, data, fileName }) =>
  new Promise((resolve, reject) => {
    const html = render(data);
    pdf.create(html).toFile((err, file) => {
      if (err) {
        console.log("error generating pdf ->", err);
        reject("error");
      } else {
        fs.readFile(file.filename, async function (err1, data) {
          if (err1) {
            console.log(err1);
            res.status(500).json({ err: "Could not read file " });
          } else {
            await fs.unlinkSync(file.filename);
            resolve(data);
          }
        });
      }
    });
  });

module.exports = {
  uploadEJSPDF,
  getEjsFile,
};
