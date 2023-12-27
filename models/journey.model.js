const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
});

const schema = new Schema(
  {
    type: { type: String, required: true },
    consultation: {
      type: Schema.Types.ObjectId,
      ref: "consultationItem",
    },
    formsAndAssessmentsResponse: {
      type: Schema.Types.ObjectId,
      ref: "responseFormsAndAssessments",
    },
    vaccine: {
      type: Schema.Types.ObjectId,
      ref: "vaccine",
    },
    campScreening: {
      type: Schema.Types.ObjectId,
      ref: "campScreeningList",
    },
    labTest: {
      type: Schema.Types.ObjectId,
      ref: "labItem",
    },
    callId: {
      type: Schema.Types.ObjectId,
      ref: "callDetails",
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_record",
      required: true,
    },
    SubType: {
      type: String,
    },
    filesUrl: {
      type: [String],
    },
    hidden: { type: Boolean, default: false },
    reportDate: {
      type: Date,
    },
    legacyData: {
      type: Schema.Types.Mixed,
    },
    procedure: {
      type: Schema.Types.ObjectId,
      ref: "procedureItem",
    },
    ipDetail: {
      type: Schema.Types.ObjectId,
      ref: "ip_detail",
    },
    to: {
      bedNo: String,
      wardNo: String,
    },
    onlyForCCDA: {
      type: Boolean,
    },
    description: {
      type: String,
    },
    vaccinationInfo: { type: Schema.Types.Mixed },
    status: { type: String },
    data: { type: Schema.Types.Mixed },
    uniqueId: { type: String },
    linkId: { type: String },
    linkType: { type: String, enum: ["IP", "OP"] },
    createdBy: userSchema,
    patientConsentResponse: { type: Boolean },
    patientConsentType: {
      type: String,
    },
  },
  { timestamps: true }
);

schema.pre(/^find/, function (next) {
  this.populate("vaccine");
  next();
});

module.exports = mongoose.model("patient_journey", schema);
