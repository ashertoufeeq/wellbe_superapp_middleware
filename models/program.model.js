const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = require("./common/model.user");

const itemSchema = new schema(
  {
    createdBy: userSchema.user,
    updatedBy: userSchema.user,
    districtName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "Program Mgmt",
    },
    stateName: {
      type: String,
    },
    programNumber: {
      type: String,
    },
    programShortCode: {
      type: String,
    },
    programStartDate: {
      type: Date,
    },
    programEndDate: {
      type: Date,
    },
    totalBeneficiaries: {
      type: Number,
    },
    issuingAuthority: {
      type: String,
    },
    labourOfficerName: {
      type: String,
    },
    labourInspectors: {
      type: [String],
    },
    keyLocations: {
      type: [String],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
    },
    numberOfPatientScreened: {
      type: Number,
    },
    status: {
      type: String,
      default: "Active",
    },
    numberScreeningsDone: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("program_mgmt", itemSchema);
