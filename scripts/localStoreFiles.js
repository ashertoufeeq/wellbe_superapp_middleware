const fs = require('fs');
const path = require('path');
const Patients = require("../models/patientRecord");
const {  getFileBufferFromUrl } = require("../utils/pdfMerge");

// Replace the S3-related code with local file storage
const localFolderPath = './labourIds'; // Change this to the desired local folder path

// Create the local folder if it doesn't exist
if (!fs.existsSync(localFolderPath)) {
  fs.mkdirSync(localFolderPath);
}

module.exports = async () => {
  i = 1;
  const labCursor = Patients.aggregate([ 
    {
      "$match": {
        consolidatedReportCampId: {"$exists": true}, 
        consolidatedReportUrl: {"$exists": true}, 
      }
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
], { allowDiskUse: true }).cursor();

  for (let action = await labCursor.next(); true; action = await labCursor.next()) {
    if (action) {
      console.log(i, action);
      const url = action.labourIdFile;
      if (url) {
        const buffer = await getFileBufferFromUrl(url);

        const type = url?.split('.')?.pop() || 'pdf';

        const districtFolder = path.join(localFolderPath, action.camp?.villageName);
        // Create the district subfolder if it doesn't exist
        if (!fs.existsSync(districtFolder)) {
          fs.mkdirSync(districtFolder);
        }

        const filePath = path.join(districtFolder, `${action.uhid}_.${type}`);
        fs.writeFileSync(filePath, buffer);

        console.log(filePath, 'saved');
      } else {
        console.log('No Labour Id', action.uhid);
      }
    } else {
      console.log('....... FINISHED .........');
      break;
    }
    i = i + 1;
  }
};
