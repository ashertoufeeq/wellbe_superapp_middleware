const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = require("./common/model.user");

const itemSchema = new schema(
  {
    createdBy: userSchema.user,
    updatedBy: userSchema.user,
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    otherInfo: {
      type: schema.Types.Mixed,
    },
    useManualStatus: {
      type: Boolean,
      deafult: false,
    },
    fromCSV: {
      type: Boolean,
    },
    campId: {
      type: String,
      ref: "camps",
    },
    patientId: {
      type: String,
      ref: "patient_record",
    },
    oldPatientId: [
      {
        type: String,
        ref: "patient_record",
      },
    ],
    isBulkScreening: {
      type: Boolean,
    },
    bulkScreeningId: {
      type: String,
      ref: "bulkScreening",
    },
    formsDetails: [
      {
        formId: { type: String, ref: "formsAndAssessments" },
        results: { type: schema.Types.Mixed },
        scores: { type: schema.Types.Mixed },
        status: { type: String },
        totalScore: { type: Number },
        useManualStatus: { type: Boolean, default: false },
        createdAt: { type: Date },
        updatedAt: { type: Date },
      },
    ],
    previousFollowupScreeningId: {
      type: String,
      ref: "campScreeningList",
    },
    previousScreeningId: {
      type: String,
      ref: "campScreeningList",
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvingReason: { type: String },
    isReassist: {
      type: Boolean,
      default: false,
    },
    resolvedBy: { type: String },
    resolvedAt: {
      type: Date,
    },
    fromExternalRegistration: {
      type: Boolean,
    },
    labItem: {
      type: schema.Types.ObjectId,
      ref: "labItem",
    },
    screeningNumber: { type: Number },
    screeningDate: { type: Date },
    isCleared: {
      type: Boolean,
      default: false,
    },
    scheduledBy: userSchema.user,
    notSubmitted: {
      type: Boolean,
      default: false,
    },
    calls: [
      {
        callId: {
          type: schema.Types.ObjectId,
          ref: "callDetails",
        },
      },
    ],
    isProcessed: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("campScreeningList", itemSchema);
