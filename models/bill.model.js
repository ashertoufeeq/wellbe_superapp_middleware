const mongoose = require("mongoose");
const schema = mongoose.Schema;

const billSchema = new schema({
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },

  completedAt: {
    type: Date,
  },
  comments: {
    type: String,
  },
  createdBy: {
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
  completedBy: {
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
  payments: [
    {
      cash: {
        amount: {
          type: Number,
        },
      },
      card: {
        amount: {
          type: Number,
        },
        lastFourDigit: {
          type: String,
        },
        txnId: {
          type: String,
        },
      },
      cheque: {
        amount: {
          type: Number,
        },
        chequeDataForPayment: [
          {
            txnId: {
              type: String,
            },
            amount: {
              type: Number,
            },
            isPaymentReceived: {
              type: Boolean,
            },
          },
        ],
      },
      online: {
        amount: {
          type: Number,
        },
        txnId: {
          type: String,
        },
        swipeData: {
          type: schema.Types.Mixed,
        },
      },
      advance: {
        amount: {
          type: Number,
        },
      },
      upi: {
        amount: {
          type: Number,
        },
        id: {
          type: String,
        },
      },
      wallet: {
        amount: {
          type: Number,
        },
        name: {
          type: String,
        },
        remarks: String,
      },
      total: {
        type: Number,
      },
      change: {
        type: Number,
      },
      isRefund: {
        type: Boolean,
      },
      isAdvanced: {
        type: Boolean,
      },
      createdAt: {
        type: Date,
        required: true,
      },
      createdBy: {
        name: {
          type: String,
          required: true,
        },
        userId: {
          type: schema.Types.ObjectId,
          required: true,
        },
        userType: {
          type: String,
          required: true,
        },
      },
    },
  ],

  chequeTransactions: [
    {
      amount: {
        type: Number,
      },
      id: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
      isPaymentReceived: {
        type: Boolean,
      },
      paidAt: {
        type: Date,
      },
      chequeNumber: {
        type: Number,
      },
      chequeBankName: {
        type: String,
      },
      chequeDate: {
        type: String,
      },
    },
  ],

  onlineTransactions: [
    {
      amount: {
        type: Number,
      },
      id: {
        type: String,
      },
      gatewayId: {
        type: String,
      },
      status: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
      paidAt: {
        type: Date,
      },
      isConsumed: {
        type: Boolean,
      },
      trackingId: { type: String, unique: true, sparse: true },
      fromCallCentre: { type: Boolean },
      isRefund: { type: Boolean },
      dispositionData: schema.Types.Mixed,
    },
  ],
  machineTransactions: [
    {
      amount: {
        type: Number,
      },
      id: {
        type: String,
      },
      status: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
      paidAt: {
        type: Date,
      },
      isConsumed: {
        type: Boolean,
      },
    },
  ],
  billAmount: {
    type: Number,
  },
  patientId: {
    type: schema.Types.ObjectId,
    ref: "patient_record",
  },
  oldPatientId: [
    {
      type: schema.Types.ObjectId,
      ref: "patient_record",
    },
  ],
  paymentTotal: {
    type: Number,
    default: 0,
  },
  billDiscount: {
    type: Number,
    default: 0,
  },
  billNumber: {
    type: String,
  },
  isAdvanced: {
    type: Boolean,
  },
  lead: {
    type: schema.Types.ObjectId,
    ref: "lead",
  },
  screeningId: {
    type: schema.Types.ObjectId,
    ref: "campScreeningList",
  },
  consultationSource: {
    type: schema.Types.ObjectId,
    ref: "consultationItem",
  },
  source: {
    type: String,
  },
  referralDoctor: {
    type: schema.Types.ObjectId,
    ref: "doctor",
  },
  referredBy: {
    type: schema.Types.ObjectId,
    ref: "doctor",
  },
  type: { type: String },
  isUnbilled: {
    type: Boolean,
    default: false,
  },
  opdLeadType: {
    type: String,
  },
  unbilledAt: {
    type: Date,
  },
  sourceDoctor: {
    type: schema.Types.ObjectId,
    ref: "doctor",
  },
  savedItems: [
    {
      forPatientBooking: {
        type: Boolean,
      },
      name: {
        type: String,
      },
      doseType: {
        type: String,
      },
      itemId: {
        type: String,
      },
      unitPrice: {
        type: Number,
      },
      gst: {
        type: Number,
      },
      total: {
        type: Number,
      },
      type: {
        type: String,
      },
      discount: {
        type: Number,
      },
      quantity: {
        type: Number,
      },
      afterType: {
        type: String,
      },
      afterNumber: {
        type: Number,
      },
      doctorId: {
        type: schema.Types.ObjectId,
        ref: "doctor",
      },
      doctorName: {
        type: String,
      },
      department: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
      scheduledAt: {
        type: Date,
      },
      doctorEvent: {
        type: schema.Types.ObjectId,
        ref: "calender_api_events",
      },
      mode: {
        type: String,
      },
      symptoms: {
        type: String,
      },
      files: [String],
      packages: {
        type: schema.Types.Mixed,
      },
      items: {
        type: schema.Types.Mixed,
      },
      appointment: {
        type: schema.Types.Mixed,
      },
      waitingList: {
        type: Boolean,
      },
      slot: {
        type: schema.Types.Mixed,
      },
      fromPatientBooking: {
        type: Boolean,
      },
      fromCallCenter: {
        type: Boolean,
      },
    },
  ],
  cleared: {
    type: Boolean,
  },
  assigningAuthority: {
    type: schema.Types.ObjectId,
    ref: "site",
  },
  contractId: {
    type: schema.Types.ObjectId,
    ref: "payer",
  },
  preAuthAmount: {
    type: Number,
  },
  preAuthNumber: {
    type: String,
  },
  insuranceNumber: {
    type: String,
  },
  insuranceValidity: {
    type: Date,
  },
  employeeId: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  insuranceFiles: [String],
  selfPayable: {
    type: Number,
  },
  contractPayable: {
    type: Number,
  },
  receivableId: {
    type: schema.Types.ObjectId,
    ref: "receivable",
  },
  mrdNumber: {
    type: String,
  },
  walkIn: {
    type: Boolean,
  },
  buckets: [
    {
      category: { type: schema.Types.ObjectId, ref: "bill_category" },
      items: [
        {
          id: {
            type: String,
          },
          name: {
            type: String,
          },
          billId: {
            //if merged from any other bill
            type: String,
          },
          price: {
            type: Number,
          },
          qty: {
            type: Number,
          },
          gst: {
            type: Number,
          },
          discount: {
            type: Number,
          },
        },
      ],
    },
  ],
  ipType: { type: String },
  ipDetailId: { type: schema.Types.ObjectId, ref: "ip_detail" },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  cancelReason: {
    type: String,
  },
  externalIds: [
    {
      type: String,
    },
  ],
  externalReceipts: [
    {
      type: String,
    },
  ],
  fromPatientBooking: {
    type: Boolean,
    default: false,
  },
  fromCallCentre: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },

  savedIPPrescription: { type: schema.Types.ObjectId, ref: "ip_prescription" },
  store: { type: schema.Types.ObjectId, ref: "store" },
});

module.exports = mongoose.model("bill", billSchema);
