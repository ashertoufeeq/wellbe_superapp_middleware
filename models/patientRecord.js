const mongoose = require('mongoose');
const schema = mongoose.Schema;

const patientRecordSchema = new schema(
    {
        fName: {
            type: String,
            required: true,
        },
        lName: {
            type: String,
        },
        gender: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        maritalStatus: {
            type: String,
        },
        fatherName: {
            type: String,
        },
        motherName: {
            type: String,
        },
        mobile: {
            type: String,
            required: true,
        },
        secondaryMobile: {
            type: String,
        },
        email: {
            type: String,
        },
        permanentAddress: {
            street: {
                type: String,
            },
            zip: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
        },
        temporaryAddress: {
            street: {
                type: String,
            },
            zip: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
        },
        preferredLanguage: {
            type: String,
        },
        education: {
            type: String,
        },
        household: {
            size: {
                type: String,
            },
            income: {
                type: String,
            },
        },
        employmentStatus: {
            type: String,
        },
        kyc: {
            type: {
                type: String,
            },
            id: {
                type: String,
            },
        },
        kycFiles: [String],
        otherFieldValues: schema.Types.Mixed,
        insurance: {
            company: {
                type: String,
            },
            policyNo: {
                type: String,
            },
            effectiveDate: {
                type: Date,
            },
        },
        careGiver: {
            name: {
                type: String,
            },
            relationship: {
                type: String,
            },
            mobile: {
                type: String,
            },
        },
        history: {
            type: String,
        },
        familyHistory: {
            type: String,
        },
        assigningAuthority: {
            type: schema.Types.ObjectId,
            ref: 'site',
        },
        createdBy: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        createdOn: {
            type: Date,
        },
        updatedOn: {
            type: String,
        },
        historyFiles: [String],
        uhid: {
            type: String,
        },
        workingDiagnosis: [String],
        allergies: [String],
        vaccines: [
            {
                name: {
                    type: String,
                },
                doseNo: {
                    type: Number,
                },
                prevents: {
                    type: String,
                },
                dueDate: {
                    type: Date,
                },
                givenOn: {
                    type: Date,
                },
                weight: {
                    type: Number,
                },
                doseAdministered: {
                    type: String,
                },
                manufacturer: {
                    type: String,
                },
                lotNo: {
                    type: String,
                },
                instructions: {
                    type: String,
                },
                signature: {
                    type: String,
                },
            },
        ],
        fullName: {
            type: String,
        },
        balance: {
            type: Number,
            default: 0,
        },
        organisationName: {
            type: String,
        },
        employeeId: {
            type: String,
        },
        isVip: {
            type: Boolean,
        },
        deathDate: {
            type: Date,
        },
        bloodGroup: {
            type: String,
            enum: ['A-', 'A+', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        externalUhid: {
            type: String,
        },
        externalRegistrationNumber: {
            type: String,
        },
        walletAmount: { type: Number },
        activityReviews: [String],
        tags: [
            {
                type: schema.Types.ObjectId,
                ref: 'tag',
            },
        ],
        clinicalTags: [
            {
                type: schema.Types.ObjectId,
                ref: 'tag',
            },
        ],
        localName: { type: String },
        localLastName: { type: String },
        localFatherName: { type: String },
        localMotherName: { type: String },
        externalIds: [
            {
                systemRef: {
                    type: String,
                },
                id: {
                    type: String,
                },
                additionalField: {
                    type: String,
                },
                externalTokenNumber: {
                    type: String,
                },
                _id: false,
            },
        ],
        consolidatedReportUrl: {
            type: String
        },
        partnerOrganization: {
            type: schema.Types.ObjectId,
            ref: 'partner_organization',
        },
        partnerName: {
            type: String,
        },
        oldPatientId: [
            {
                type: schema.Types.ObjectId,
                ref: 'patient_record',
            },
        ],
        mergedFields: [{ type: schema.Types.Mixed, default: [] }],
        disablePatient: { type: Boolean, default: false },
        ipdType: { type: String },
        tags: [
            {
                type: schema.Types.ObjectId,
                ref: 'tag',
            },
        ],
        clinicalTags: [
            {
                type: schema.Types.ObjectId,
                ref: 'tag',
            },
        ],
        isRegistrationDone: {
            type: Boolean,
        },
        registeredAuthorities: [
            {
                type: schema.Types.ObjectId,
                ref: 'site',
            },
        ],
        initialRegisteredAuthorities: [
            {
                type: schema.Types.ObjectId,
                ref: 'site',
            },
        ],
        externalTokenNumber: {
            type: String,
        },
        metaData: schema.Types.Mixed,
        isRestricted: {
            type: Boolean,
        },
        nationality: { type: String },
        localName: { type: String },
        localFatherName: { type: String },
        localMotherName: { type: String },
        labourIdFile: { type: String },
        dependantRationCardFile: { type: String },
        labourId: { type: String },
        labourBeneficiaryType: { type: String },
        profileUrl: {
            type: String,
        },
    },
    { timestamps: true },
);

patientRecordSchema.index({
    fullName: 'text',
    uhid: 'text',
    externalUhid: 'text',
    mobile: 'text',
    employeeId: 'text',
    'externalIds.id': 'text',
    fName: 'text',
    lName: 'text',
    'kyc.id': 'text',
    localName: 'text',
});
patientRecordSchema.index({ createdAt: 1 });
patientRecordSchema.index({ mobile: 1 });
patientRecordSchema.index({ 'externalIds.id': 1 });
patientRecordSchema.index({ disablePatient: 1 });

patientRecordSchema.pre('save', function (next) {
    this.fullName = this.lName ? this.fName + ' ' + this.lName : this.fName;
    this.fullName = this.fullName.trim();
    next();
});

module.exports = mongoose.model('patient_record', patientRecordSchema);
