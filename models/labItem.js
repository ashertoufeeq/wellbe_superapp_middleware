const mongoose = require("mongoose");
const schema = mongoose.Schema;
const QueueSchema = require("./queueSchema");

const labItemSchema = new schema({
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
  createdBy: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: schema.Types.ObjectId,
    },
    userType: {
      type: String,
      required: true,
    },
  },
  updatedBy: {
    name: {
      type: String,
    },
    userId: {
      type: schema.Types.ObjectId,
    },
    userType: {
      type: String,
    },
  },
  billId: {
    type: schema.Types.ObjectId,
    ref: "bill",
  },
  packages: [
    {
      underContract: {
        type: Boolean,
      },
      name: {
        type: String,
        required: true,
      },
      packageId: {
        type: schema.Types.ObjectId,
        ref: "item",
      },
      discount: {
        type: Number,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      reportData: {
        parameters: [
          {
            name: {
              type: String,
            },
            machineCode: {
              type: String,
            },
            value: {
              type: String,
            },
          },
        ],
        editorState: String,
        noTableReport: Boolean,
      },
      reportUrl: {
        type: String,
      },
      signUrl: {
        type: String,
      },
      sample: {
        notes: {
          type: Boolean,
        },
        collectedAt: {
          type: Date,
        },
        collectedBy: {
          name: {
            type: String,
          },
          userId: {
            type: schema.Types.ObjectId,
          },
          userType: {
            type: String,
          },
        },
      },
      department: {
        type: String,
      },
      gst: {
        type: Number,
      },
      cleared: {
        type: Boolean,
        default: false,
      },
      uploadedAt: {
        type: Date,
      },
      activities: [
        {
          at: {
            type: Date,
          },
          type: {
            type: String,
            // SUBMIT | REVIEW | REJECT
          },
          by: {
            name: {
              type: String,
            },
            userId: {
              type: schema.Types.ObjectId,
              ref: "doctor",
            },
            userType: {
              type: String,
            },
          },
          rejectionReason: {
            type: String,
          },
          reportUrl: {
            type: String,
          },
        },
      ],
    },
  ],
  paid: {
    type: Boolean,
    default: false,
  },
  throughDesk: {
    type: Boolean,
    default: true,
  },
  type: {
    type: "String",
    default: "LAB",
  },
  patientId: {
    type: schema.Types.ObjectId,
    ref: "patient_record",
  },
  clearReason: {
    type: String,
  },
  oldPatientId: [
    {
      type: schema.Types.ObjectId,
      ref: "patient_record",
    },
  ],
  sourceId: {
    type: schema.Types.ObjectId,
    ref: "consultationItem",
  },
  cleared: {
    type: Boolean,
    default: false,
  },
  billNumber: {
    type: String,
    required: true,
  },
  isUnbilled: {
    type: Boolean,
    default: false,
  },
  screeningId: {
    type: schema.Types.ObjectId,
    ref: "campScreeningList",
  },
  leadId: {
    type: schema.Types.ObjectId,
    ref: "lead",
  },
  packageId: {
    type: schema.Types.ObjectId,
    ref: "packageItem",
  },

  hidden: { type: Boolean },
  ipDetailId: { type: schema.Types.ObjectId, ref: "ip_detail" },
  queue: { type: QueueSchema },

  prescribingDoctor: {
    type: schema.Types.ObjectId,
    ref: "doctor",
  },
});

module.exports = mongoose.model("labItem", labItemSchema);
