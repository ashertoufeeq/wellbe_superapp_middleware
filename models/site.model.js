const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: false },
    address: { type: String },
    gstin: { type: String },
    notes: { type: String },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('site', schema);