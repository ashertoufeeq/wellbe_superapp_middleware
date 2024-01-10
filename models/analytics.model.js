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
      default: "No Data",
    },
    "Labour Id": { type: String },
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
      default: "Not Done",
    },
    "Basic Health Checkup Done By": {
      type: String,
    },
    "Phlebotomy Response": {
      type: String,
      default: "No Data",
    },
    "Phlebotomy Done By": {
      type: String,
    },
    "Audiometry Status": {
      type: String,
      default: "Not Done",
    },
    "Audiometry Done By": {
      type: String,
    },
    "Otology Status": {
      type: String,
      default: "Not Done",
    },
    "Optometry Status": {
      type: String,
      default: "Not Done",
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
      default: "Pending",
    },
    "Lab Clear Reason": {
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
    Mobile: {
      type: String,
    },
    Barcode: {
      type: String,
    },
    "Report Distributed": {
      type: String,
    },
    "Report Distribution Time": {
      type: Date,
    },
    sourceName: {
      type: String,
      ...(process.env.SOURCE && { default: process.env.SOURCE }),
    },
    Height: {
      type: String
    },
    Weight: {
      type: String
    },
    BMI: {
      type: String
    },
    Spo2: {
      type: String
    },
    Temperature: {
      type: String
    },
    Systolic_Blood_Pressure: {
      type: String
    },
    Diastolic_Blood_Pressure: {
      type: String
    },
    pulse: {
      type: String
    },
  
  //Lab Parameters
  "BLOOD GROUP AND Rh TYPE": String,
  "GLUCOSE RANDOM": String,
  "CREATININE SERUM": String,
  "UREA": String,
  "URIC ACID": String,
  "CHOLESTEROL TOTAL": String,
  "TRIGLYCERIDES": String,
  "HDL CHOLESTEROL": String,
  "VLDL CHOLESTEROL": String,
  "LDL CHOLESTEROL": String,
  "CHOLESTEROL / HDL RATIO": String,
  "TOTAL BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)": String,
  "DIRECT BILIRUBIN(CALCULATED)": String,
  "INDIRECT BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)": String,
  "ASPARTATE TRANSAMINASE (SGOT) (UV WITH P5P)": String,
  "ALANINE TRANSAMINASE(SGPT) (UV WITH P5P)": String,
  "ALKALINE PHOSPHATASE(PNPP)": String,
  "GGT(G-GLUTAMYL-P-NITROANILIDE)": String,
  "TOTAL PROTEIN (BIURET)": String,
  "ALBUMIN (BROMOCRESOL GREEN)": String,
  "GLOBULIN(CALCULATED)": String,
  "A/G RATIO(CALCULATED)": String,
  "VOLUME": String,
  "APPEARANCE": String,
  "Sp.GRAVITY": String,
  "LEUCOCYTES (PUS CELLS)": String,
  "NITRATE": String,
  "UROBILINOGEN": String,
  "PROTEIN": String,
  "pH": String,
  "BLOOD": String,
  "URINE KETONE BODIES": String,
  "BILIRUBIN": String,
  "URINE GLUCOSE": String,
  " HIV HUMAN IMMUNO DEFICIENCY VIRUS HIV I + II": String,
  "HBsAg - Hepatitis B surface antigen": String,
  "HCV Ab - Hepatitis C virus Antibody": String,
  "V.D.R.L": String,
  "MALARIAL PARASITES": String,
  "TRIIODOTHYRONINE - T3": String,
  "THYROXINE - T4": String,
  "THYROID STIMULATING HORMONE": String,
  "HAEMOGLOBIN  (COLORIMETRIC METHOD)": String,
  "RBC (SHEATH FLOW DC DETECTION)": String,
  "HCT(CALCULATED)": String,
  "MCV(CALCULATED)": String,
  "MCH(CALCULATED)": String,
  "MCHC(CALCULATED)": String,
  "RDW-CV(CALCULATED)": String,
  "PLATELET COUNT(SHEATH FLOW DC DETECTION)": String,
  "TOTAL WBC COUNT": String,
  "NEUTROPHILS": String,
  "LYMPHOCYTES": String,
  "MONOCYTES": String,
  "EOSINOPHILS": String,
  "BASOPHILS": String,
  "PERFORMED : ERYTHROCYTE SEDIMENTATION RATE": String,
  "ESR": String,
  "MAGNESIUM": String,
  "C-REACTIVE PROTEIN": String,
  "IRON": String,
  "FERRITIN": String,
  "HBA1c": String,
  "Labour Id File": { type: String },
  "Optometry History": { type: String },
  "Optometry Symptoms": { type: String },
  "Occular Findings": { type: String },
  "External Eye Examination": { type: String },
  "Optometry Refraction": { type: String },
  "Visual Acuity RE": { type: String },
  "Visual Acuity LE": { type: String },
  "RE Spherical": { type: String },
  "LE Spherical": { type: String },
  "RE Cylindrical": { type: String },
  "LE Cylindrical": { type: String },
  "RE Axis": { type: String },
  "LE Axis": { type: String },
  "Re Addition": { type: String },
  "LE Addition": { type: String },
  "Optomerty Comment": { type: String },
  "left_freq_500": { type: String },
  "left_freq_1000": { type: String },
  "left_freq_2000": { type: String },
  "left_freq_4000": { type: String },
  "right_freq_500": { type: String },
  "right_freq_1000": { type: String },
  "right_freq_2000": { type: String },
  "right_freq_4000": { type: String }
  },
  { timestamps: true }
);

module.exports = {
  analyticsSchema,
  analyticsModel: mongoose.model(
    "custom_analytics_screenings",
    analyticsSchema
  ),
};
