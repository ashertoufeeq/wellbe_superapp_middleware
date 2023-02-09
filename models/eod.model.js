const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = require("./common/model.user");

const itemSchema = new schema(
  {
    createdBy: userSchema.user,
    updatedBy: userSchema.user,
    campId: {
      type: schema.Types.ObjectId,
      ref: "camps",
    },
    type: { type: String },
    reason: { type: String },
    date: { type: Date },
    patients: [
      {
        patientId: { type: schema.Types.ObjectId, ref: "patient_record" },
        insertedTime: { type: Date },
        labReached: { type: Boolean, default: false },
        labTime: { type: Date },
        labUser: userSchema.user,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("campeod", itemSchema);
