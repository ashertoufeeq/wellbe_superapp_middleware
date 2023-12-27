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
        Height: "160",
        // uvcData: [
        //   {
        //     fileId: "1674462980775",
        //     fileLocalUrl:
        //       "file:///storage/emulated/0/DCIM/Camera/IMG_JJCamera_20230123140620704.jpg",
        //     comment: "Normal",
        //     fileUrl:
        //       "https://myteleopd.s3.ap-south-1.amazonaws.com/IMG_JJCamera_20230123140620704-1674463054081.jpg",
        //   },
        // ],
        Systolic_Blood_Pressure: "118",
        Diastolic_Blood_Pressure: "76",
        Spo2: "98",
        pulse: "96",
        Temperature: "97",
        Weight: "55",
        fef: "86",
        pef: "74",
        fev1: "59",
        fev6: "68",
        Heart: "Normal-SiS2 heart (+)",
        Lung: "Normal- B/L NVBS",
        Abdomen: "Normal-P/A soft BS Non Tender",
        stethoscopeData: null,
      },
      formId: "63b021a27e77bb4d6248b203",
      scores: {
        BMI: 0,
      },
      totalScore: 0,
      status: "noRisk",
    },
  ],
  screeningNumber: 4,
  previousScreeningId: "63ce474be34e6e564f3c6ed9",
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
            formsDetails.formId.toString() === "63b021a27e77bb4d6248b203" &&
            !!formsDetails.results.Height &&
            !!formsDetails.results.Weight
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
      //   formsDetails.formId = ObjectId(formsDetails.formId);
      formsDetails.results.Height = String(_.random(150, 180));
      formsDetails.results.Weight = String(_.random(50, 80));

      formsDetails.results.Systolic_Blood_Pressure = String(_.random(100, 140));
      formsDetails.results.Diastolic_Blood_Pressure = String(_.random(60, 90));
      formsDetails.results.Spo2 = String(_.random(90, 100));
      formsDetails.results.pulse = String(_.random(60, 100));
      formsDetails.results.Temperature = String(_.random(95, 100));

      formsDetails.results.fef = String(_.random(1, 5));
      formsDetails.results.pef = String(_.random(1, 5));

      formsDetails.results.fev1 = String(_.random(1, 5));
      formsDetails.results.fev6 = String(_.random(1, 5));

      formsDetails.results.Heart = getRandom([
        "Abnormal-Whossing",
        "Normal-SiS2 heart (+)",
        "Abnormal- Murmess",
        "Abnormal- Rasping",
        "Abnormal- Blowing Sand",
      ]);
      formsDetails.results.Lung = getRandom([
        "Normal- B/L NVBS",
        "Abnormal- Rohonchi low pitched",
        "Craeles-high pitched whistling sound",
        "Strides- breath vibrator sound",
      ]);
      formsDetails.results.Abdomen = getRandom([
        "Normal-P/A soft BS Non Tender",
        "Abnormal-Spleenomegaly",
        "Abnormal- Hepatomegaly",
        "Abnormal-Urinary Retention",
        "Abnormal- Destention",
        "Abnormal- Decreased Bowel",
        "Abnormal- Abdominal Mass",
        "Abnormal- Umbilical Hernia",
        "Abnormal- Inguinal Hernia",
        "Abnormal Rigidity",
      ]);
      //   formsDetails.scores.BMI = _.random(0, 1);
      formsDetails.totalScore = _.random(0, 1);
      formsDetails.status = getRandom([
        "noRisk",
        "lowRisk",
        "highRisk",
        "veryHighRisk",
      ]);
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
  const camps = await Camps.find({
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
