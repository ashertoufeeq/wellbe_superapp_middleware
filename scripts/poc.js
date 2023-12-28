const uhids = require("./uhids.json");
const all = require("./all.json");
const fs = require("fs");
const Screenings = require("../models/campScreening.model");
const Patients = require("../models/patientRecord");
const Lab = require("../models/labItem");
const _ = require("lodash");

console.log(uhids.length);

const missingScreenings = [];
const missingLabs = [];

const getAll = async () => {
  console.log("fetching patients");
  const patients = await Patients.find(
    { uhid: { $in: uhids } },
    { _id: 1, uhid: 1 }
  );
  fs.writeFileSync("./all.json", JSON.stringify(patients, null, 2));
};

const getMissingScreenings = async () => {
  console.log("Running");
  for (const patient of all) {
    const previousScreenings = await Screenings.find({
      patientId: patient._id,
      ///
    });
    console.log(
      `Found ${previousScreenings.length} previousScreenings for ${patient.uhid}`
    );
    if (previousScreenings.length > 0) {
      const $exists = _.some(previousScreenings, (previousScreening) =>
        _.some(
          previousScreening.formsDetails,
          (formsDetails) =>
            formsDetails.formId.toString() === "63b021a27e77bb4d6248b203" &&
            !!formsDetails.results.Height &&
            !!formsDetails.results.Weight
        )
      );

      if ($exists) {
        console.log(
          `Found basic details for ${patient.uhid} in previousScreenings, skipping...`
        );

        continue;
      } else {
        console.log("Not Found");
        missingScreenings.push(patient);
      }
    }
  }
  console.log("Missing ->", missingScreenings.length);
  fs.writeFileSync(
    "./missingscreenings.json",
    JSON.stringify(missingScreenings, null, 2)
  );
  console.log("all done");
};

const getMissingLab = async () => {
  console.log("Running");
  for (const patient of all) {
    const lab = await Lab.find({
      patientId: patient._id,
      packages: {
        $elemMatch: { reportUrl: { $exists: false }, cleared: false },
      },
      ///
    });

    if (lab.length > 0) {
      console.log("Lab pending ->", patient.uhid);

      missingLabs.push(patient);
    } else {
      console.log("Lab completed ->", patient.uhid);
    }
  }
  console.log("Missing ->", missingLabs.length);
  fs.writeFileSync("./missingLabs.json", JSON.stringify(missingLabs, null, 2));
  console.log("all done");
};

module.exports = async () => {
  await getMissingLab();
  console.log("ALL done");
};
