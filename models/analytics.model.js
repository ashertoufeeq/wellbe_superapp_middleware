const mongoose = require("mongoose");
const schema = mongoose.Schema;

const analyticsSchema = new schema(
  {
    "Patient Id": {
      type: schema.Types.ObjectId,
      ref: "patient_records",
    },
    "First Name": {
      type: String,
      default: null,
    },
    "Last Name": {
      type: String,
      default: null,
    },
    Gender: {
      type: String,
      default: null,
    },
    DOB: {
      type: Date,
    },
    Age: {
      type: Number,
    },
    "Age Group": {
      type: String,
      default: null,
    },
    UHID: {
      type: String,
    },
    Camp: {
      type: String,
      default: null,
    },
    "Labour Id": { type: String },
    campId: {
      type: schema.Types.ObjectId,
      ref: "camps",
    },
    Village: {
      type: String,
    },
    Taluka: {
      type: String,
    },
    "Pin Code": {
      type: String,
    },
    "Work Order Number": {
      type: String,
    },
    "Work Order Short Code": {
      type: String,
    },
    "Screening Date": {
      type: Date,
    },
    "Registration Done By": {
      type: String,
    },
    "Basic Health Checkup Status": {
      type: String,
    },
    "Basic Health Checkup Done By": {
      type: String,
    },
    "Phlebotomy Response": {
      type: String,
    },
    "Phlebotomy Done By": {
      type: String,
    },
    "Audiometry Status": {
      type: String,
    },
    "Audiometry Done By": {
      type: String,
    },
    "Otology Status": {
      type: String,
    },
    "Optometry Status": {
      type: String,
    },

    "Optometry Done By": {
      type: String,
    },

    "Report Generated": {
      type: String,
    },
    "Report URL": {
      type: String,
    },
    "Report Sent At": {
      type: Date,
    },
    "Lab Test Status": {
      type: String,
    },
    "Sample Collection Time": {
      type: Date,
    },
    "Sample Received Time": {
      type: Date,
    },
    "Lab Result Completion Time": {
      type: Date,
    },
    "Users Involved": [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("custom_analytics_screenings", analyticsSchema);
