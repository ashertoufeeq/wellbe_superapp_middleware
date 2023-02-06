const sendMessageBird = require("../utils/message");
const moment = require("moment");
const mongoose = require("mongoose");

const ObjectId = require("mongoose").Types.ObjectId;
const ScreeningModel = require("../models/campScreening.model");

module.exports = async () => {
  const dateFilter = {
    createdAt: {
      $gte: moment().startOf("day").toISOString(),
      $lte: moment().endOf("day").toISOString(),
    },
    _id: {
      $in: [
        ObjectId("63cbba75cad9a26310336b93"),
        ObjectId("63cbbb65cad9a26310336ca2"),
        ObjectId("63cbbb4fcad9a26310336c37"),
      ],
    },
  };
  const screenings = await ScreeningModel.find({
    ...dateFilter,
  })
    .populate([{ path: "patientId" }, { path: "campId" }])
    .exec();

  const patients = screenings.reduce((acc, curr) => {
    const patient = curr.patientId;
    if (patient && patient._id) {
      if (!acc[patient._id]) {
        acc[patient._id] = {
          name: patient.fullName,
          mobile: patient.mobile,
          uhid: patient.uhid,
        };
      }
    }
    return acc;
  }, {});

  for (const patientId of Object.keys(patients)) {
    const patient = patients[patientId];
    const res = await sendMessageBird({
      to: patient.mobile,
      templateId: "healthcampcomplete",
      textParameters: [patient.name, patient.uhid],
    });
    console.log(res.data);
  }
};
