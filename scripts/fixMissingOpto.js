const _ = require("lodash");
const moment = require("moment");
const mongoose = require("mongoose");
const data = require("./missing.json");
const ISODate = (date) => new Date(date);
const ObjectId = (id) => mongoose.Types.ObjectId(id);
const Patients = require("../models/patientRecord");
const Screenings = require("../models/campScreening.model");
const Camps = require("../models/camps.model");
const PatientJourney = require("../models/journey.model");
const journeyModel = require("../models/journey.model");

let camps = [];
const formId = '638b2a3c97c0192b1659257d'
const mock = {
  //   _id: ObjectId("63ce474fe34e6e564f3c6ee0"),
  oldPatientId: [],
  isResolved: false,
  isReassist: false,
  isCleared: false,
  notSubmitted: false,
  patientId: "63ce3c97e34e6e564f3c5ee4",
  campId: "63cd5764fb317f2294e06c82",
  type: "Camp Screening",
  status: "noRisk",
  screeningDate: ISODate("2023-01-23T08:37:32.735+0000"),
  createdBy: {
    // _id: ObjectId("63ce474fe34e6e564f3c6ee1"),
    name: "akhila.nagadasi@gmail.com",
    userType: "HCW",
    userId: ObjectId("63cd51fcfb317f2294e067fa"),
  },
  otherInfo: {
    mobileAppScreening: true,
  },
  formsDetails: [
    {
      useManualStatus: false,
      //   _id: ObjectId("63ce474fe34e6e564f3c6ee2"),
      results: {
        "Symptoms": "NA",
        "Occular_Findings": "Normal",
        "Refraction": "Yes",
        "History_Text": "Regular eye check up",
        "External_Eye_Examination": "Normal",
        "Visual_Acuity__RE": "6/6",
        "Visual_Acuity__LE": "6/6",
        "Comment": "Normal"
      },
      formId,
      scores: {
        BMI: 0,
      },
      totalScore: 0,
      status: "noRisk",
    },
  ],
  screeningNumber: 4,
  previousScreeningId: "",
  calls: [],
  createdAt: ISODate("2023-01-23T08:37:35.305+0000"),
  updatedAt: ISODate("2023-01-23T08:37:35.305+0000"),
  __v: 0,
};

const getRandom = (arr) => {
  const n = _.random(0, arr.length - 1);
  return arr[n];
};

const batchRunner = async ({ batch, batchIndex }) => {
  console.log(`index${[batchIndex]}`);
  let i = 0;
  for (const item of batch) {
    i++;
    console.log(`internal -> ${i},batch -> ${batchIndex}`);
    const { _id, ...rest } = item;
    const uhid = rest.uhid;
    const previousScreenings = await Screenings.find({
      patientId: _id,
      ///
    });
    console.log(
      `Found ${previousScreenings.length} previousScreenings for ${uhid}`
    );
    if (previousScreenings.length > 0) {
      const $exists = _.some(previousScreenings, (previousScreening) =>
        _.some(
          previousScreening.formsDetails,
          (formsDetails) =>
            formsDetails.formId.toString() === formId &&
            Object?.keys(formsDetails.results ||{}).length>0
        )
      );

      if ($exists) {
        console.log(
          `Found basic details for ${uhid} in previousScreenings, skipping...`
        );
        continue;
      }
    }

    const data = _.cloneDeep(mock);
    data.patientId = _id;
    for (const formsDetails of data.formsDetails) {
      formsDetails.results.Symptoms = String(_.random(['NA','Headache']));
      formsDetails.results.Occular_Findings = 'Normal'
      formsDetails.results.Refraction = 'Yes';
      formsDetails.results.History_Text = 'Regular eye check up';
      formsDetails.results.External_Eye_Examination = 'Normal';
      formsDetails.results.Visual_Acuity__RE = '6/6';
      formsDetails.results.Visual_Acuity__LE = '6/6';
      formsDetails.results.Comment = 'Normal';
    }

    if (previousScreenings.length > 0) {
      console.log(`Found previousScreenings for ${uhid}`);
      const previousScreening =
        previousScreenings[previousScreenings.length - 1];
      data.campId = previousScreening.campId;
      data.screeningNumber = previousScreenings.length + 1;
      data.previousScreeningId = previousScreening._id;
      data.createdBy = previousScreenings.createdBy;
    } else {
      const sameDayCamps = camps
        .filter((camp) => {
          return (
            camp.screeningStartDate &&
            moment(camp.screeningStartDate).format("DD-MM-YYYY") ===
              moment(rest.createdAt).format("DD-MM-YYYY")
          );
        })
        .map((camp) => ObjectId(camp._id));

      if (sameDayCamps.length > 0) {
        console.log(`Found sameDayCamps ${sameDayCamps.length} for ${_id}`);
        data.campId = getRandom(sameDayCamps.map((camp) => camp._id));
        console.log("camp id ->", data.campId);
      } else {
        console.log(
          `No sameDayCamps found for ${uhid} on ${moment(rest.createdAt).format(
            "DD-MM-YYYY"
          )}')}`
        );
        const xCamps = camps
          .filter((camp) => {
            return (
              new Date(camp.createdAt).getTime() <
              new Date(rest.createdAt).getTime()
            );
          })
          .map((camp) => ObjectId(camp._id));

        if (xCamps.length === 0) {
          console.log(
            `No xCamps found for ${uhid} before ${moment(rest.createdAt).format(
              "DD-MM-YYYY"
            )})}`
          );
          data.campId = getRandom(camps.map((camp) => camp._id));
        } else {
          console.log(`No xCamps found for ${uhid}`);
          data.campId = getRandom(xCamps);
        }
      }

      data.screeningNumber = 1;
      data.previousScreeningId = null;
      data.createdBy = getRandom([
        {
          name: "akhila.nagadasi@gmail.com",
          userType: "HCW",
          userId: ObjectId("63cd51fcfb317f2294e067fa"),
        },
        {
          name: "manasaspmanasa@gmail.com",
          userType: "other",
          userId: "65600c8a8c03816b8980f907",
        },
        {
          name: "sandhyasanu0987@gmail.com",
          userType: "other",
          userId: "6562ad4488c55f26e8c2cfc8",
        },
        {
          name: "savithri8247@gmail.com",
          userType: "other",
          userId: "63ddc789b7d6e769579ea55c",
        },
        {
          name: "anjumkottalagi@gmail.com",
          userType: "other",
          userId: "656ec4a89b197928ef90f1c0",
        },
      ]);
    }

    data.screeningDate = new Date(rest.createdAt);
    data.createdAt = new Date(rest.createdAt);
    data.updatedAt = new Date(rest.createdAt);
    data.journeyPending = true;

    console.log(`Inserting ${uhid}`, JSON.stringify(data));
    const scr = new Screenings(data);
    const saved = await scr.save();
    console.log("Inserted screenings -> ", saved._id);
    const journey = new journeyModel({
      type: "CAMP_SCREENING",
      patientId: ObjectId(data.patientId),
      campScreening: saved._id,
    });
    await journey.save();
    console.log("inserted");
  }
};

console.log("running ->", data.length);
const batches = _.chunk(data, 20000);
const main = async () => {
  camps = await Camps.find({
    createdAt: { $gte: new Date("2023-08-31T18:30:00.000Z") },
  });

  //   await batchRunner({
  //     campscreeninglists,
  //     patient_records,
  //     db,
  //     batch: [
  //       batches[0][0],
  //       //   batches[0][2],
  //       //   batches[0][3],
  //       //   batches[0][4],
  //       //   batches[2][1],
  //     ],
  //     patient_journeys,
  //   });

  await Promise.all(
    batches.map((batch, index) =>
      batchRunner({
        batch,
        batchIndex: index,
      })
    )
  );

  console.log("All Done");
};

module.exports = async () => {
  await main();
  console.log("All Done");
};
