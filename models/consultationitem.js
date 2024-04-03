const mongoose = require('mongoose');
const moment = require('moment-timezone');

const schema = mongoose.Schema;

const consultationItemSchema = new schema({
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
  source: {
    type: String,
  },
  reminderJobId: {
    type: String,
  },
  bookedVia: {
    type: String,
  },
  leadId: {
    type: schema.Types.ObjectId,
    ref: 'lead',
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
  preferredTime: {
    type: Date,
  },
  scheduledAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  patientId: {
    type: schema.Types.ObjectId,
    ref: 'patient_record',
    index: true,
  },
  oldPatientId: [
    {
      type: schema.Types.ObjectId,
      ref: 'patient_record',
    },
  ],
  symptoms: {
    type: String,
  },
  status: {
    type: String,
  },
  doctorId: {
    type: schema.Types.ObjectId,
    ref: 'doctor',
  },
  files: [String],
  filesByPatient: [String],
  prescription: {
    type: String,
  },
  mode: {
    type: String,
  },
  voiceSid: {
    type: String,
  },
  voiceRecordings: [String],
  prescriptionData: {
    type: schema.Types.Mixed,
  },
  prescriptions: {
    type: schema.Types.Mixed,
  }, // for Ipd
  runningOrderItems: [
    {
      type: {
        type: String,
      },
      itemId: {
        type: String,
      },
    },
  ],
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
  procedures: [
    {
      name: {
        type: String,
      },
      afterType: {
        type: String,
      },
      afterNumber: {
        type: String,
      },
      notes: {
        type: String,
      },
      id: {
        type: String,
      },
      date: {
        type: Date,
      },
    },
  ],
  labTest: [
    {
      name: {
        type: String,
      },
      testId: {
        type: schema.Types.ObjectId,
        ref: 'item',
      },
      externalCode: { type: String },
    },
  ],
  eyePrescription: {
    type: schema.Types.Mixed,
  },
  eyePrescriptionDate: {
    type: Date,
  },
  eyePrescriptionUrl: {
    type: String,
  },
  vcRoom: {
    type: String,
  },
  vcRoomStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  doctorRemindedForVc: {
    type: Boolean,
  },
  videoRecordings: [
    {
      time: Date,
      url: String,
    },
  ],
  type: {
    type: String,
    required: true,
  },
  forms: {
    type: schema.Types.Mixed,
  },
  sentForms: [String],
  lastRx: {
    type: String,
  },
  allergies: {
    type: String,
  },
  hcw: {
    type: String,
  },
  servicesData: {
    type: schema.Types.Mixed,
  },
  history: {
    type: String,
  },
  billId: {
    type: schema.Types.ObjectId,
    ref: 'bill',
  },
  itemId: {
    type: schema.Types.ObjectId,
    ref: 'item',
  },
  total: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  department: {
    type: String,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  throughDesk: {
    type: Boolean,
    default: true,
  },
  isFollowUp: {
    type: Boolean,
  },
  gst: {
    type: Number,
  },
  privateNotes: {
    type: Boolean,
  },
  privateComplaints: {
    type: Boolean,
  },
  privateSymptoms: {
    type: Boolean,
  },
  privateDiagnosis: {
    type: Boolean,
  },
  privateVitals: {
    type: Boolean,
  },
  billNumber: {
    type: String,
    required: true,
  },
  labTest: {
    type: schema.Types.ObjectId,
    ref: 'labItem',
  },
  bedJourney: [
    {
      bed: {
        type: schema.Types.ObjectId,
        ref: 'bed',
      },
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
    },
  ],
  dischargeOrdered: {
    type: Boolean,
  },
  isBoolean: {
    type: Boolean,
  },
  dischargedOrderedBy: {
    type: schema.Types.ObjectId,
    ref: 'doctor',
  },
  isDischarged: {
    type: Boolean,
  },
  completedBySystem: {
    type: Boolean,
  },
  followUpType: {
    type: String,
  },
  followUpNumber: {
    type: Number,
  },
  unscheduledReason: {
    type: String,
  },
  unscheduleType: {
    type: String,
  },
  rescheduleReason: {
    type: String,
  },
  patientRescheduleCount: {
    type: Number,
  },
  doctorEvent: {
    type: schema.Types.ObjectId,
    ref: 'calender_api_events',
  },
  roomId: {
    type: schema.Types.ObjectId,
    ref: 'site_room',
  },
  roomEvent: {
    type: schema.Types.ObjectId,
    ref: 'calender_api_events',
  },
  packageId: {
    type: schema.Types.ObjectId,
    ref: 'packageItem',
  },
  hideCarePlans: {
    type: Boolean,
  },
  isTeleV2: {
    type: Boolean,
    default: true,
  },
  internallyReferredBy: {
    type: schema.Types.ObjectId,
    ref: 'doctor',
  },
  subjectiveRefraction: {
    type: schema.Types.Mixed,
  },
  carePlanTriggeredId: {
    type: schema.Types.ObjectId,
    ref: 'careItemTriggered',
  },
  underContract: {
    type: Boolean,
  },
  underClass: {
    type: Boolean,
  },
  calls: [
    {
      callId: {
        type: schema.Types.ObjectId,
        ref: 'callDetails',
      },
    },
  ],
  secondOpinion: [
    {
      secondOpinionStatus: {
        type: String,
        enum: {
          initiated: 'initiated',
          in_progress: 'in_progress',
          completed: 'completed',
        },
      },
      secondOpinionDepartment: {
        type: String,
      },
      secondOpinionDoctorId: {
        type: schema.Types.ObjectId,
        ref: 'doctor',
      },
      secondOpinionNote: {
        type: String,
      },
      prefferedSecondOpinionDate: {
        type: Date,
      },
      secondOpinionInitiatedAt: {
        type: Date,
      },
      secondOpinionAccessedAt: {
        type: Date,
      },
      secondOpinionCompletedAt: {
        type: Date,
      },
    },
  ],
  appointmentId: { type: schema.Types.ObjectId, ref: 'appointment' },
  externalConsultationId: { type: String, index: true },
  externalVisitId: { type: String },
  externalTokenNumber: { type: String },
  updateStatusLogs: [
    {
      reason: { type: String },
      createdBy: { type: schema.Types.ObjectId, ref: 'user' },
      createdAt: { type: Date },
    },
  ],
  visitId: { type: String },
  isAdmissionRequested: {
    type: Boolean,
    default: false,
  },
  isViewed: { type: Boolean },
  queue: { type: schema.Types.Mixed },
  isFollowUp: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false },
  waitingList: { type: Boolean },
  fromPatientBooking: {
    type: Boolean,
    default: false,
  },
  patientBookingType: {
    type: String,
    enum: ['WEB', 'APP'],
  },
  fromCallCentre: {
    type: Boolean,
    default: false,
  },
  fromQMS: {
    type: Boolean,
    default: false,
  },
  isVitalsDone: {
    type: Boolean,
    default: false,
  },
  firstVisit: {
    type: Boolean,
    default: false,
  },
  callCentreLinkSettled: {
    type: Boolean,
    default: false,
  },
  cancelledBy: {
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
  fromExternalSource: {
    type: Boolean,
  },
  updateStatusLogs: [
    {
      reason: { type: String },
      createdBy: { type: schema.Types.ObjectId, ref: 'user' },
      createdAt: { type: Date },
    },
  ],
  externalValidityString: {
    type: String,
  },
  metaData: {
    type: schema.Types.Mixed,
  },
  integrationStatus: {
    type: String,
  },
  externalReceipt: {
    type: String,
  },
  doctorTimingsType: {
    type: String,
    default: 'CASH',
  },
  isCorporate: {
    type: Boolean,
  },
  isProcessed: {
    type: Boolean
  }
});

consultationItemSchema.index({ '$**': 'text' });

module.exports = mongoose.model('consultationItem', consultationItemSchema);