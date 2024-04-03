const mongoose = require("mongoose");
const schema = mongoose.Schema;

const analyticsSchema = new schema(
  {
    "Patient Id": {
      type: schema.Types.ObjectId,
      ref: "patient_records",
    },
    consultationId: {
        type: schema.Types.ObjectId,
        ref: "consultationItem",
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
      default: "No Data",
    },
    "Labour Id File": { type: String },
    "Labour Id": { type: String },
    "Labour Document Type":{ type: String },
    "Labour Beneficiary Type":{ type: String },
    "Kyc":{
        type: {
          type: String,
        },
        id: {
          type: String,
        },
      } ,
    "Kyc Files":{ type: [String] },
    "Doctor Name":{ type: String },
    "Doctor Id":{  type: schema.Types.ObjectId,
        ref: "doctors", },
    prescriptionData: {
            type: schema.Types.Mixed,
          },
          medicines: [
            {
              name: {
                type: String,
              },
              form: {
                type: String,
              },
              strength: {
                type: String,
              },
              frequency: {
                type: schema.Types.Mixed,
              },
              code: {
                type: String,
              },
              medicineId: {
                type: schema.Types.ObjectId,
                ref: 'item',
              },
              composition: {
                type: String,
              },
              days: {
                type: Number,
              },
              dayType: {
                type: String,
              },
              instructions: {
                type: String,
              },
              externalUnit: { type: String },
              externalCode: { type: String },
            },
          ],
    campId: {
      type: schema.Types.ObjectId,
      ref: "camps",
    },
    Village: {
      type: String,
      default: "No Data",
    },
    Taluka: {
      type: String,
    },

    "Sub Division": {
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
    assigningAuthority: {
        type: schema.Types.ObjectId,
        ref: "site",
    },
    assigningAuthorityName: {
        type: schema.Types.ObjectId,
        ref: "site",
    },
    Mobile: {
      type: String,
    },
    sourceName: {
      type: String,
      ...(process.env.SOURCE && { default: process.env.SOURCE }),
    },
  },
  { timestamps: true }
);

module.exports = {
  analyticsSchema,
  analyticsModel: mongoose.model(
    "custom_analytics_consultations",
    analyticsSchema
  ),
};
